import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { generateUUID } from "@/lib/utils";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { authOptions } from "@/app/(auth)/auth";
import { getServerSession } from "next-auth/next";
import {
  type Message,
  type Attachment,
  convertToCoreMessages,
  createDataStream,
  createDataStreamResponse,
} from "ai";
import { del } from "@vercel/blob";
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { id, messages }: { id: string; messages: Array<Message> } =
      await request.json();
    // const coreMessages = convertToCoreMessages(messages);
    const coreMessages = messages;
    const session = await getServerSession(authOptions);
    const chat = await getChatById({ id });
    if (!chat) {
      const title = messages[0].content ?? "New chat";
      const userId = session?.user?.id ?? "anonymous";
      await saveChat({ id, userId, title });
    }
    const userMessage = messages[messages.length - 1]?.content || "";
    const userMessageId = generateUUID();

    await saveMessages({
      messages: [
        {
          role: "user",
          content: userMessage,
          id: userMessageId,
          createdAt: new Date(),
          chatId: id,
        },
      ],
    });

    if (!process.env.BACKEND_URL) {
      throw new Error("BACKEND_URL is not defined");
    }

    const response = await fetch(process.env.BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userMessage }),
    });
    const data = await response.json();
    const myString = data.result;

    let Attachments: Array<Attachment> = [];

    const assistantMessage = {
      role: "assistant" as "assistant",
      content: myString,
      id: generateUUID(),
      createdAt: new Date(),
      chatId: id,
      ...(Attachments.length !== 0 && {
        experimental_attachments: Attachments,
      }),
    };

    await saveMessages({ messages: [assistantMessage] });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // In this example, we'll enqueue one character at a time:
        for (let i = 0; i < myString.length; i++) {
          const chunk = myString[i];
          // Encode the chunk as a Uint8Array
          controller.enqueue(encoder.encode(chunk));
          // (Optional) small delay to demonstrate streaming
          await new Promise((res) => setTimeout(res, 8));
        }

        // When finished, close the stream
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // These headers help ensure the response isn't buffered by the browser
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
    // return NextResponse.json(assistantMessage, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting chat", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknow error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });
    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (err: any) {
    console.error("Error deleting chat", err);
    return new Response("An error occurred while deleting the chat", {
      status: 500,
    });
  }
}
