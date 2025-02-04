import React, { useEffect, useState } from "react";
import { FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { PiSidebarFill, PiBrainDuotone } from "react-icons/pi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import styles from "./Sidebar.module.css";
import { BetterTooltip } from "./ui/Tooltip";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "next-auth";
import useSWR from "swr";
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import { toast } from "sonner";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import { is } from "drizzle-orm";
import { isToday, isYesterday, set, subMonths, subWeeks } from "date-fns";
import { RiDeleteBack2Fill } from "react-icons/ri";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  toggleSidebar,
  user,
  chatId,
}) => {
  const router = useRouter();
  return (
    <div
      className={`${
        isVisible
          ? "w-60 h-screen bg-base-300 relative box-border overflow-hidden"
          : "w-0"
      }`}
    >
      {isVisible && (
        <div>
          <div className="flex-none">
            <div className={"flex items-center mb-2 justify-between px-4 pt-4"}>
              <div className="tooltip tooltip-right " data-tip="Close sidebar">
                <PiSidebarFill className={"w-5 h-5"} onClick={toggleSidebar} />
              </div>
              <div
                className="tooltip tooltip-left "
                data-tip="New chat"
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
              >
                <HiOutlinePencilSquare className={"w-5 h-5"} />
              </div>
            </div>
          </div>
          <div className="overflow-y-auto overflow-x-hidden">
            <div
              className={
                "text-2xl font-title items-center flex text-base-content px-4"
              }
            >
              <PiBrainDuotone className={"w-8 h-8 fill-base-content"} />
              <span className={"p-2"}>ixAutoDaT</span>
            </div>
            <div className="divider my-0 px-1"></div>
            <SidebarHistory user={user} id={chatId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const SidebarHistory = ({ user, id }: { user: User; id: string }) => {
  const pathname = usePathname();
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== id);
          }
        });
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });
    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push("/");
    }
  };

  if (!user) {
    return (
      <div className="text-sm px-1 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
        Login to save and revisit previous chats!
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="px-2 py-1 text-xs">Today</div>
        <div className="text-sm flex flex-col">
          {[44, 32, 28, 64, 52].map((item) => (
            <div
              key={item}
              className="rounded-md h-8 flex gap-1 px-2 items-center"
            >
              <div
                className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-neutral-content"
                style={
                  { "--skeleton-width": `${item}%` } as React.CSSProperties
                }
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (history?.length === 0) {
    return (
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="text-sm px-1 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
          Your conversations will appear here once you start chatting.
        </div>
      </div>
    );
  }

  const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);
        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats
    );
  };

  const groupedChats = groupChatsByDate(history);

  return (
    <div className="relative flex w-full flex-col">
      <ul className="menu menu-sm w-full bg-base-300">
        {groupedChats.today.length > 0 && (
          <>
            <li className="menu-title pl-0 font-bold">Today</li>
            {groupedChats.today.map((chat) => (
              <li
                key={chat.id}
                className={`w-full flex items-center relative group ${
                  chat.id === id ? "bg-neutral/10 rounded-full" : ""
                } `}
                onClick={() => {
                  router.push(`/chat/${chat.id}`);
                  router.refresh();
                }}
              >
                <div className="w-full">
                  <span className="w-full truncate text-left">
                    {chat.title}
                  </span>
                  <div
                    className={`tooltip tooltip-button place-self-end group-hover:flex ${
                      chat.id === id ? "flex" : "hidden"
                    }`}
                    data-tip="Delete"
                    onClick={() => {
                      event.stopPropagation();
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBack2Fill className="w-4 h-4" />
                  </div>
                  {/* <button className="btn btn-ghost btn-xs h-full  w-7 place-self-end hidden group-hover:flex"> */}
                  {/* </button> */}
                </div>
              </li>
            ))}
          </>
        )}
        {groupedChats.yesterday.length > 0 && (
          <>
            <li className="menu-title pl-0 font-bold">Yesterday</li>
            {groupedChats.yesterday.map((chat) => (
              <li
                key={chat.id}
                className={`w-full flex items-center relative group ${
                  chat.id === id ? "bg-neutral/10 rounded-full" : ""
                } `}
                onClick={() => {
                  router.push(`/chat/${chat.id}`);
                  router.refresh();
                }}
              >
                <div className="w-full">
                  <span className="w-full truncate text-left">
                    {chat.title}
                  </span>
                  <div
                    className={`tooltip tooltip-button place-self-end group-hover:flex ${
                      chat.id === id ? "flex" : "hidden"
                    }`}
                    data-tip="Delete"
                    onClick={() => {
                      event.stopPropagation();
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBack2Fill className="w-4 h-4" />
                  </div>
                  {/* <button className="btn btn-ghost btn-xs h-full  w-7 place-self-end hidden group-hover:flex"> */}
                  {/* </button> */}
                </div>
              </li>
            ))}
          </>
        )}
        {groupedChats.lastWeek.length > 0 && (
          <>
            <li className="menu-title pl-0 font-bold">Previous 7 Days</li>
            {groupedChats.lastWeek.map((chat) => (
              <li
                key={chat.id}
                className={`w-full flex items-center relative group ${
                  chat.id === id ? "bg-neutral/10 rounded-full" : ""
                } `}
                onClick={() => {
                  router.push(`/chat/${chat.id}`);
                  router.refresh();
                }}
              >
                <div className="w-full">
                  <span className="w-full truncate text-left">
                    {chat.title}
                  </span>
                  <div
                    className={`tooltip tooltip-button place-self-end group-hover:flex ${
                      chat.id === id ? "flex" : "hidden"
                    }`}
                    data-tip="Delete"
                    onClick={() => {
                      event.stopPropagation();
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBack2Fill className="w-4 h-4" />
                  </div>
                  {/* <button className="btn btn-ghost btn-xs h-full  w-7 place-self-end hidden group-hover:flex"> */}
                  {/* </button> */}
                </div>
              </li>
            ))}
          </>
        )}
        {groupedChats.lastMonth.length > 0 && (
          <>
            <li className="menu-title pl-0 font-bold">Previous 30 Days</li>
            {groupedChats.lastMonth.map((chat) => (
              <li
                key={chat.id}
                className={`w-full flex items-center relative group ${
                  chat.id === id ? "bg-neutral/10 rounded-full" : ""
                } `}
                onClick={() => {
                  router.push(`/chat/${chat.id}`);
                  router.refresh();
                }}
              >
                <div className="w-full">
                  <span className="w-full truncate text-left">
                    {chat.title}
                  </span>
                  <div
                    className={`tooltip tooltip-button place-self-end group-hover:flex ${
                      chat.id === id ? "flex" : "hidden"
                    }`}
                    data-tip="Delete"
                    onClick={() => {
                      event.stopPropagation();
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBack2Fill className="w-4 h-4" />
                  </div>
                  {/* <button className="btn btn-ghost btn-xs h-full  w-7 place-self-end hidden group-hover:flex"> */}
                  {/* </button> */}
                </div>
              </li>
            ))}
          </>
        )}

        {groupedChats.older.length > 0 && (
          <>
            <li className="menu-title pl-0 font-bold">Older</li>
            {groupedChats.older.map((chat) => (
              <li
                key={chat.id}
                className={`w-full flex items-center relative group ${
                  chat.id === id ? "bg-neutral/10 rounded-full" : ""
                } `}
                onClick={() => {
                  router.push(`/chat/${chat.id}`);
                  router.refresh();
                }}
              >
                <div className="w-full">
                  <span className="w-full truncate text-left">
                    {chat.title}
                  </span>
                  <div
                    className={`tooltip tooltip-button place-self-end group-hover:flex ${
                      chat.id === id ? "flex" : "hidden"
                    }`}
                    data-tip="Delete"
                    onClick={() => {
                      event.stopPropagation();
                      setDeleteId(chat.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBack2Fill className="w-4 h-4" />
                  </div>
                  {/* <button className="btn btn-ghost btn-xs h-full  w-7 place-self-end hidden group-hover:flex"> */}
                  {/* </button> */}
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
