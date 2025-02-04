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
          <span className={"p-2"}>ixAutoDaT</span>
        </div>
        <p>
          Welcome to ixAutoDaT, a chatbot that can help you{" "}
          <Link
            className={"font-semibold underline underline-offset-4 "}
            href="/automl"
            //   target="_blank"
          >
            automatic train a model
          </Link>{" "}
          for DaT SPECT image classification, and provide you with the
          explanation of the model and the decision-making process.
        </p>
        <p>
          Let's start by training a new model or uploading a pre-trained model.
        </p>
      </div>
    </div>
  );
};

export default Overview;
