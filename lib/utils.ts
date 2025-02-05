import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  ToolInvocation,
  Message,
} from "ai";

import type { Message as DBMessage } from "@/lib/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    // if (message.role === "tool") {
    //   return addToolMessageToChat({
    //     toolMessage: message as CoreToolMessage,
    //     messages: chatMessages,
    //   });
    // }

    let textContent = "";
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    }
    // } else if (Array.isArray(message.content)) {
    //   for (const content of message.content) {
    //     if (content.type === "string") {
    //       textContent += content.text;
    //     } else if (content.type === "tool-call") {
    //       toolInvocations.push({
    //         state: "call",
    //         toolCallId: content.toolCallId,
    //         toolName: content.toolName,
    //         args: content.args,
    //       });
    //     }
    //   }
    // }

    chatMessages.push({
      id: message.id,
      role: message.role as Message["role"],
      content: textContent,
      toolInvocations,
    });
    return chatMessages;
  }, []);
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}
