import React from "react";
import { type Message } from "ai";
import { generateUUID } from "@/lib/utils";

export const SuggestedActions = ({
  messages,
  setMessages,
}: {
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
}) => {
  const suggestedActions = [
    {
      title: "Train a new model",
      label: "using AutoML.",
      action: "Train a new model using AutoML",
    },
    {
      title: "Upload a model",
      label: "from your local machine.",
      action: "Upload a model from local machine",
    },
  ];

  const handleAddMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateUUID(),
        role: "user",
        content: content,
        createdAt: new Date(),
        experimental_attachments: [],
      },
    ]);
  };
  return (
    <div className="grid sm:grid-cols-2 gap-4 w-full py-2.5">
      {suggestedActions.map((action, index) => (
        <button
          key={index}
          className="text-left border rounded-xl px-4 py-2.5 text-md gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-slate-100"
          onClick={() => handleAddMessage(action.action)}
        >
          <span className="font-medium">{action.title}</span>
          <br />
          <span className="font-normal text-slate-600 ">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
