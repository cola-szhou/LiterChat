"use client";

import React from "react";
import Overview from "./Overview";
import { PreviewMessage } from "./Message";
import { ChatRequestOptions, Message } from "ai";
import { memo } from "react";
import exp from "constants";

interface MessageProps {
  chatId: string;
  isLoading: boolean;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

const ChatMessages = ({
  chatId,
  isLoading,
  messages,
  setMessages,
  reload,
}: MessageProps) => {
  return (
    <div className="flex flex-1 flex-col pt-2 relative mb-3 w-2/3 place-self-center">
      {messages.length === 0 && <Overview key={"overview"} />}
      {messages.length > 0 &&
        messages.map((message, index) => (
          <PreviewMessage
            key={message.id || index}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            setMessages={setMessages}
            reload={reload}
          />
        ))}
    </div>
  );
};

export default ChatMessages;
