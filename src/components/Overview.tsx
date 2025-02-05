import React from "react";
import { PiBrainDuotone } from "react-icons/pi";
import Link from "next/link";

const Overview = () => {
  return (
    <div
      className={
        "w-full rounded-xl pt-28 px-10 flex flex-col leading-relaxed text-center text-base-content"
      }
    >
      <div className="w-[36rem] place-self-center">
        <div
          className={
            "text-5xl font-title items-center flex flex-row justify-center gap-4 "
          }
        >
          <PiBrainDuotone className={"w-14 h-14"} />
          <span className={"p-2"}>LiterChat</span>
        </div>
        <p>Welcome to LiterChat, a chatbot that can help you...</p>
      </div>
    </div>
  );
};

export default Overview;
