"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
  use,
} from "react";
import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
import { Textarea } from "./ui/Textarea";
import cx from "classnames";
import { BsFillSendFill } from "react-icons/bs";
import { IoMdAttach, IoIosSend } from "react-icons/io";
import { SuggestedActions } from "./SuggestedActions";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { toast } from "sonner";
import { is } from "drizzle-orm";
import PreviewAttachment from "@/components/PreviewAttachment";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  onSendMessage,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: { preventDefault: () => void },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className: string;
  onSendMessage: (message: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
      textareaRef.current.scrollTop =
        textareaRef.current.scrollHeight -
        textareaRef.current.clientHeight -
        20;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQuene, setUploadQuene] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error("Failed to upload file, please try again later!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      console.log("Files", files);
      setUploadQuene(files.map((file) => file.name));
      console.log(
        "Upload quene",
        files.map((file) => file.name)
      );
      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        toast.error("Error uploading files!", error);
      } finally {
        setUploadQuene([]);
      }
    },
    [setAttachments]
  );
  console.log("attachments", attachments);
  return (
    <div className="relative w-2/3 mt-3 mb-3 justify-center place-self-center">
      {/*Suggested actions*/}
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQuene.length === 0 && (
          <div>
            <SuggestedActions />
          </div>
        )}
      {/*Input area*/}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />
      {(attachments.length > 0 || uploadQuene.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment, index) => (
            <PreviewAttachment key={index} attachment={attachment} />
          ))}

          {uploadQuene.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{ url: "", name: filename, contentType: "" }}
              isUploading={true}
            />
          ))}
        </div>
      )}
      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className="min-h-4 max-h-44 w-full overflow-auto resize-none rounded-2xl text-lg mb-2 p-3 pb-10 bg-base-200/80"
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error(
                "Please wait for the response before sending another message"
              );
            } else {
              submitForm();
            }
          }
        }}
      />
      {/* Attach file button */}
      <div
        className="tooltip absolute bottom-4 right-14"
        data-tip="Attach file"
      >
        <button
          className=" btn btn-sm btn-circle rounded-full p-1.5 h-fit shadow-md"
          onClick={(event) => {
            event.preventDefault();
            fileInputRef.current?.click();
          }}
          disabled={isLoading}
        >
          <IoMdAttach className="w-5 h-5 text-neutral" />
        </button>
      </div>

      {/* Send message button */}

      {isLoading && (
        <button className="btn btn-sm btn-circle btn-neutral rounded-full h-fit absolute bottom-4 right-3  shadow-md">
          <span className="loading loading-spinner"></span>
        </button>
      )}
      {!isLoading && (
        <div
          className="tooltip absolute bottom-4 right-3"
          data-tip="Send message "
        >
          <button
            className=" btn btn-sm btn-circle  btn-neutral rounded-full h-fit   shadow-md disabled:opacity-60"
            onClick={(event) => {
              event.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0}
          >
            <IoIosSend className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
