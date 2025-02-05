import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/app/(auth)/auth";
import { getServerSession } from "next-auth/next";
import fs from "fs/promises";
import path from "path";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    // console.log("Request", request.formData());
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validFile = FileSchema.safeParse({ file });

    if (!validFile.success) {
      const errorMessage = validFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData
    const filename = (formData.get("file") as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const uploadsDir = path.resolve("public/uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, Buffer.from(fileBuffer));

      return NextResponse.json({
        url: `/uploads/${filename}`,
        pathname: filename,
        contentType: file.type,
      });
    } catch (error) {
      console.error("Error uploading file", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading file", error);
    return NextResponse.json({ error: error }, { status: 501 });
  }
}
