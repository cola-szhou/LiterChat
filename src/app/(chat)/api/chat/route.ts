import { NextRequest, NextResponse } from "next/server";
import { generateUUID } from "@/lib/utils";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { authOptions } from "@/app/(auth)/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { type Message, type Attachment, convertToCoreMessages } from "ai";
import { del } from "@vercel/blob";
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { id, messages }: { id: string; messages: Array<Message> } =
      await request.json();
    console.log("messages", messages);
    // const coreMessages = convertToCoreMessages(messages);
    const coreMessages = messages;
    console.log("coremessages", coreMessages);
    console.log("id", id);
    const session = await getServerSession(authOptions);
    const chat = await getChatById({ id });
    if (!chat) {
      const title = messages[0].content ?? "New chat";
      console.log("userId", session.user.id);
      await saveChat({ id, userId: session.user.id, title });
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

    const myString = "This is the response for: " + userMessage;
    let Attachments: Array<Attachment> = [];

    const assistantMessage = {
      role: "assistant",
      content: myString,
      id: generateUUID(),
      createdAt: new Date(),
      chatId: id,
      ...(Attachments.length !== 0 && {
        experimental_attachments: Attachments,
      }),
    };

    await saveMessages({ messages: [assistantMessage] });

    return NextResponse.json(assistantMessage, { status: 200 });
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
  console.log("delete_id", id);

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
