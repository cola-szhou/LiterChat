import { authOptions } from "@/app/(auth)/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { getChatByUserId } from "@/lib/db/queries";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chats = await getChatByUserId({ id: session.user.id! });
  return Response.json(chats);
}
