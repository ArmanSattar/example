"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { CasesIcon, ChatIcon, IconProps } from "../navbar/NavIcon";
import { useDispatch, useSelector } from "react-redux";
import { toggleChatBarClicked } from "../../../store/slices/chatBarSlice";
import { RootState } from "../../../store";

interface BottomNavbarItems {
  name: string;
  icon: React.FC<IconProps>;
  href?: string;
}

const bottomNavItems: BottomNavbarItems[] = [
  {
    name: "Chat",
    icon: ChatIcon,
  },
  {
    name: "Cases",
    icon: CasesIcon,
    href: "/cases",
  },
];

export const BottomNavbar = () => {
  const dispatch = useDispatch();
  const isChatbarOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const pathname = usePathname();

  return (
    <div className="sticky md:hidden flex bottom-0 inset-x-0 z-50 bg-background w-full h-16 justify-between items-center">
      <div className="flex justify-between items-center w-full px-4 h-full">
        <ul className="flex justify-between w-full h-full">
          {bottomNavItems.map((item, index) => (
            <li key={index} className="flex flex-col items-center justify-center flex-1 group">
              {item.href ? (
                <Link href={item.href} className="flex flex-col items-center">
                  <item.icon
                    className={`h-10 w-10  text-gray-400 hover:text-red-500 duration-75 ${
                      pathname.startsWith(item.href) && !isChatbarOpen ? "text-red-500" : ""
                    }`}
                  />
                </Link>
              ) : (
                <div
                  onClick={() => {
                    if (!isChatbarOpen) {
                      dispatch(toggleChatBarClicked());
                    }
                  }}
                >
                  <item.icon
                    className={`h-10 w-10 text-gray-400 hover:text-red-500 duration-75 cursor-pointer ${
                      isChatbarOpen ? "text-red-500" : ""
                    }`}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
