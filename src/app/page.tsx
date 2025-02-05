import { cookies } from "next/headers";

import { Chat } from "@/components/Chat";
import { generateUUID } from "@/lib/utils";
import { authOptions } from "@/app/(auth)/auth";
import { getServerSession } from "next-auth/next";
import { DataStreamHandler } from "@/components/data-stream-handler";

export default async function Page() {
  const [session, cookieStore] = await Promise.all([
    getServerSession(authOptions),
    cookies(),
  ]);

  const id = generateUUID();

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Chat
        id={id}
        initialMessages={[]}
        user={session?.user ?? { id: "guest", name: "Guest User", email: "" }}
      />
      <DataStreamHandler id={id} />
    </div>
  );
}
