import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Chat } from "../../../../components/Chat";
import { get } from "http";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { authOptions } from "@/app/(auth)/auth";
import { getServerSession } from "next-auth/next";
import { convertToUIMessages } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });
  if (!chat) {
    return notFound();
  }

  const [session, cookieStore] = await Promise.all([
    getServerSession(authOptions),
    cookies(),
  ]);

  const messagesFromDB = await getMessagesByChatId({ id: id });

  return (
    <div>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDB)}
        user={session?.user ?? { id: "guest", name: "Guest User", email: "" }}
      ></Chat>
      <DataStreamHandler id={id} />
    </div>
  );
}
