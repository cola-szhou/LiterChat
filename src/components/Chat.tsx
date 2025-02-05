"use client";

import React, { useState, useEffect } from "react";
import type { Attachment, Message } from "ai";

import { useChat } from "ai/react";
import useSWR, { useSWRConfig } from "swr";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import { fetcher } from "@/lib/utils";
import { User } from "next-auth";
import { generateUUID } from "@/lib/utils";

export const Chat = ({
  id,
  initialMessages,
  user,
}: {
  id: string;
  initialMessages: Array<Message>;
  user: User;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    api: "/api/chat",
    body: { id },
    initialMessages,
    onResponse: async (response) => {
      // console.log("response", response);
      const data = await response.json();
      // console.log("data", data);
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          role: "assistant",
          content: data.content,
          createdAt: data.createdAt,
          experimental_attachments: data.experimental_attachments,
        },
      ]);
    },
    onFinish: () => {
      mutate("/api/history");
    },
  });

  useEffect(() => {
    console.log("Messages from useChat:", messages);
  }, [messages]);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  return (
    <div className="w-screen h-screen flex bg-base-100 text-base-content overflow-hidden">
      <Sidebar
        isVisible={isVisible}
        toggleSidebar={toggleSidebar}
        user={user}
        chatId={id}
      />
      <div className="w-full h-full flex flex-col items-center bg-base-100">
        <div className="w-full flex-none">
          <ChatHeader
            isVisible={isVisible}
            toggleSidebar={toggleSidebar}
            user={user}
          />
        </div>
        <div className="w-full flex-1 overflow-y-auto">
          <ChatMessages
            chatId={id}
            isLoading={isLoading}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
          />
        </div>
        <div className="flex-none w-full">
          <ChatInput
            chatId={id}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};
