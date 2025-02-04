import { NextResponse } from "next/server";
import { getUser, createUser } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 }
      );
    }
    const existingUser = await getUser(email);
    // const existingUser = await db
    //   .select()
    //   .from(user)
    //   .where(eq(user.email, email));
    if (existingUser.length > 0) {
      // throw new Error("user existed");
      return NextResponse.json({ error: "email existed" }, { status: 400 });
    }

    await createUser(email, password);

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("Failed:", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
