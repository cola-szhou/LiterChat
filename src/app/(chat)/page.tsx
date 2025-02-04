import { cookies } from "next/headers";

import { Chat } from "@/components/Chat";
import { generateUUID } from "@/lib/utils";
import { authOptions } from "@/app/(auth)/api/auth/[...nextauth]/route";
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
        className={"w-screen h-screen flex "}
        id={id}
        initialMessages={[]}
        user={session?.user}
      />
      <DataStreamHandler id={id} />
    </div>
  );
}
