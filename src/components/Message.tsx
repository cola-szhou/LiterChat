import React from "react";
import { BsStars } from "react-icons/bs";
import PreviewAttachment from "@/components/PreviewAttachment";
import { type Message, ChatRequestOptions } from "ai";

export const PreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  reload,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) => {
  const sender = message.role;
  const text = message.content;
  return (
    <div className="w-full overflow-hidden">
      {sender === "user" ? (
        <div>
          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment, index) => (
                  <PreviewAttachment
                    key={index}
                    attachment={attachment}
                    className="w-40"
                  />
                ))}
              </div>
            )}
          </div>
          <div
            key={message.id}
            className="chat chat-end pl-20 break-all pb-2"
            // "p-3 rounded-xl break-all bg-blue-100 min-w-0 max-w-md flex justify-self-end whitespace-pre-wrap"
          >
            <div className="chat-bubble">{text}</div>
          </div>
        </div>
      ) : (
        <div
          key={message.id}
          className=" rounded-xl text-wrap flex flex-row place-self-start gap-1 break-all"
        >
          <div className="w-7 h-7 flex-none flex items-center justify-center rounded-full border border-black-100">
            <BsStars className="w-3 h-3" />
          </div>
          <div>
            <div className={"w-full pt-1 pl-3 whitespace-pre-wrap"}>{text}</div>
            <div className="flex flex-col gap-2 w-full ">
              {message.experimental_attachments && (
                <div className="flex flex-row justify-begin gap-2">
                  {message.experimental_attachments.map((attachment, index) => (
                    <PreviewAttachment
                      key={index}
                      attachment={attachment}
                      className="w-40"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
