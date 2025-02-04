import React from "react";
import { Message, ChatMessagesProps } from "./ChatMessages";

export const SuggestedActions = ({
  messages,
  setMessages,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
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
    const newMessage = { sender: "User", text: content };
    setMessages((prev) => [...prev, newMessage]);
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
