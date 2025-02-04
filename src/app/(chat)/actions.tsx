"use server";

import { type CoreUserMessage, generateText } from "ai";
import { cookies } from "next/headers";
import {
  deleteMessageByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from "@/lib/db/queries";
import { VisibilityType } from "@/components/Visibility-selector";

export async function generateTitleFromUserMessages({
  message,
}: {
  message: CoreUserMessage;
}) {
  return message.content;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });
  await deleteMessageByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
