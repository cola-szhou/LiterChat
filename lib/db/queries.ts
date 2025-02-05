"server-only";

import "dotenv/config";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { and, asc, desc, eq, gt, gte } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  user,
  chat,
  // document,
  // type Suggestion,
  // suggestion,
  type Message,
  message,
  // type Vote,
  // vote,
} from "./schema";
import { create } from "domain";
import { BlockKind } from "@/components/block";
import { db } from "@/lib/db/index";
import { generateUUID } from "@/lib/utils";

export async function getUser(email: string) {
  try {
    const users = await db.select().from(user).where(eq(user.email, email));
    return users;
  } catch (error) {
    console.error("Failed to get user from database!");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);
  const id = generateUUID();

  try {
    return await db
      .insert(user)
      .values({ id: id, email: email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database!");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db
      .insert(chat)
      .values({ id, createdAt: Date.now(), userId, title });
  } catch (error) {
    console.error("Failed to save chat in database!");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(message).where(eq(message.chatId, id));
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database!");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database!");
    throw error;
  }
}

export async function getChatByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chat by user id from database!");
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database!");
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, id));
    // .orderBy(asc(message.createdAt));
    return messages;
  } catch (error) {
    console.error("Failed to get messages by chat id from database!");
    throw error;
  }
}

export async function deleteMessageByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );
  } catch (error) {
    console.error(
      "Failed to delete messages by chat id after timestamp from database!"
    );
    throw error;
  }
}

// export async function saveDocument({
//   id,
//   title,
//   kind,
//   content,
//   userId,
// }: {
//   id: string;
//   title: string;
//   kind: BlockKind;
//   content: string;
//   userId: string;
// }) {
//   try {
//     return await db
//       .insert(document)
//       .values({ id, title, kind, content, userId, createAt: new Date() });
//   } catch (error) {
//     console.error("Failed to save document in database!");
//     throw error;
//   }
// }

// export async function getDocumentsById({ id }: { id: string }) {
//   try {
//     const documents = await db
//       .select()
//       .from(document)
//       .where(eq(document.userId, id))
//       .orderBy(desc(document.createAt));

//     return documents;
//   } catch (error) {
//     console.error("Failed to get documents by id from database!");
//     throw error;
//   }
// }

// export async function getDocymentByID({ id }: { id: string }) {
//   try {
//     const [selectedDocument] = await db
//       .select()
//       .from(document)
//       .where(eq(document.id, id))
//       .orderBy(desc(document.createAt));
//     return selectedDocument;
//   } catch (error) {
//     console.error("Failed to get document by id from database!");
//     throw error;
//   }
// }

// export async function deleteDocumentsByIdAfterTimestamp({
//   id,
//   timestamp,
// }: {
//   id: string;
//   timestamp: Date;
// }) {
//   try {
//     return await db
//       .delete(document)
//       .where(and(eq(document.userId, id), gt(document.createAt, timestamp)));
//   } catch (error) {
//     console.error(
//       "Failed to delete documents by id after timestamp from database!"
//     );
//     throw error;
//   }
// }

// export async function getVotesByChatId({ id }: { id: string }) {
//   try {
//     return await db.select().from(vote).where(eq(vote.chatId, id));
//   } catch (error) {
//     console.error("Failed to get votes by chat id from database", error);
//     throw error;
//   }
// }

// export async function voteMessage({
//   chatId,
//   messageId,
//   type,
// }: {
//   chatId: string;
//   messageId: string;
//   type: "up" | "down";
// }) {
//   try {
//     const [existingVote] = await db
//       .select()
//       .from(vote)
//       .where(and(eq(vote.messageId, messageId)));

//     if (existingVote) {
//       return await db
//         .update(vote)
//         .set({ isUpvoted: type === "up" })
//         .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
//     }
//     return await db.insert(vote).values({
//       chatId,
//       messageId,
//       isUpvoted: type === "up",
//     });
//   } catch (error) {
//     console.error("Failed to upvote message in database", error);
//     throw error;
//   }
// }

// export async function updateChatVisibilityById({
//   chatId,
//   visibility,
// }: {
//   chatId: string;
//   visibility: "private" | "public";
// }) {
//   try {
//     return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
//   } catch (error) {
//     console.error("Failed to update chat visibility in database", error);
//     throw error;
//   }
// }
