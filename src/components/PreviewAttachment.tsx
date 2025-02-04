import React from "react";
import type { Attachment } from "ai";
import { IoReloadOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";

const PreviewAttachment = ({
  attachment,
  isUploading = false,
  className = "w-16",
}: {
  attachment: Attachment;
  isUploading?: boolean;
  className?: string;
}) => {
  const { name, url, contentType } = attachment;
  console.log("attachment_pa", attachment);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className=" aspect-video bg-muted rounded-md relative flex flex-col items-conter justify-center">
        {contentType ? (
          contentType.startsWith("image") ? (
            <img
              key={url}
              src={url}
              alt={name ?? "An image attachment"}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <IoReloadOutline />
          </div>
        )}
      </div>
      <div className=" text-xs text-zinc-500 truncate">{name}</div>
    </div>
  );
};

export default PreviewAttachment;
