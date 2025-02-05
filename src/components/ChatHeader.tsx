"use client";

import React, { useState, useEffect } from "react";
import { BetterTooltip } from "./ui/Tooltip";
import { PiSidebar, PiBrainDuotone } from "react-icons/pi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaCircleUser, FaGithub } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// interface SidebarProps {
//   isVisible: boolean;
//   toggleSidebar: () => void;
// }

const ChatHeader = ({
  isVisible,
  toggleSidebar,
  user,
}: {
  isVisible: boolean;
  toggleSidebar: () => void;
  user: any;
}) => {
  const router = useRouter();
  return (
    <div className="flex w-full justify-between p-4">
      {!isVisible ? (
        <div className={"flex gap-3 place-self-start"}>
          <div className="tooltip tooltip-right " data-tip="Open sidebar">
            <PiSidebar className={"w-5 h-5"} onClick={toggleSidebar} />
          </div>
          <div
            className="tooltip tooltip-right "
            data-tip="New chat"
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
          >
            <HiOutlinePencilSquare className={"w-5 h-5"} />
          </div>
        </div>
      ) : (
        <div></div>
      )}

      <div className={"flex gap-3 place-self-end"}>
        <label className="grid cursor-pointer place-items-center">
          <input
            type="checkbox"
            value="night"
            // value={isdark ? "night" : "cupcake"}
            // checked={isdark}
            // onChange={handleThemeChange}
            // onChange={() => setIsdark(!isdark)}
            className="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1"
          />
          <svg
            className="stroke-base-100 fill-base-100 col-start-1 row-start-1"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <svg
            className="stroke-base-100 fill-base-100 col-start-2 row-start-1"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
        {user.id === "guest" && (
          <div className="tooltip tooltip-left " data-tip="Sign in">
            <a href="/login" className="block">
              <FaCircleUser className={"w-5 h-5"} />
            </a>
          </div>
        )}
        {user.id !== "guest" && (
          <div className="dropdown dropdown-end dropdown-hover z-50">
            <div tabIndex={0} role="button">
              <FaCircleUser className={"w-5 h-5"} />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box  mw-48 p-4 mt-2  shadow-md text-base-content text-left overflow-hidden"
            >
              <li className="text-center font-blod">
                <p className="truncate">Hello {user.email}!</p>
              </li>
              <hr className="border-t border-gray-300 my-1 mt-2" />
              <li>
                <a className="flex items-center text-left">
                  <IoSettingsOutline className={"w-4 h-4"} />
                  Setting
                </a>
              </li>

              <li
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
              >
                <a>
                  <MdOutlineLogout className={"w-4 h-4"} />
                  Logout
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
