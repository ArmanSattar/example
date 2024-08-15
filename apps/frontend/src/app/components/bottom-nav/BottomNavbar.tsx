"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import GamePad from "../../../../public/icons/Gamepad.svg";
import Medal from "../../../../public/icons/Medal.svg";
import Podium from "../../../../public/icons/Podium.svg";
import Wallet from "../../../../public/icons/wallet.svg";
import Case from "../../../../public/icons/Case.svg";

interface BottomNavbarItems {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
}

const bottomNavItems: BottomNavbarItems[] = [
  {
    name: "Chat",
    icon: GamePad,
    href: "/chat",
  },
  {
    name: "Cases",
    icon: Case,
    href: "/cases",
  },
  {
    name: "Cases",
    icon: Podium,
    href: "/leaderboards",
  },
  {
    name: "Cases",
    icon: Medal,
    href: "/rewards",
  },
  {
    name: "Profile",
    icon: Wallet,
    href: "/profile",
  },
];

export const BottomNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="sticky md:hidden flex bottom-0 inset-x-0 z-50 bg-background w-full h-14 justify-between items-center border-t-color_gray_3 border-t-[1px]">
      <ul className="flex justify-center items-center w-full h-full">
        {bottomNavItems.map((item, index) => (
          <li
            key={index}
            className={`flex relative flex-col items-center flex-1 h-full justify-center group transition-colors duration-250 ease-in-out ${
              pathname.startsWith(item.href) ? "bg-chatbar_bg" : ""
            }`}
          >
            <Link href={item.href} className="flex flex-col items-center">
              <div
                className={`h-7 w-7 flex items-center justify-center text-white hover:text-red-500 duration-75`}
              >
                <item.icon
                  className={`scale-[115%] ${
                    pathname.startsWith(item.href) ? "text-color_primary" : "text-white"
                  }`}
                />
              </div>
              <div
                className={`absolute inset-x-0 bottom-0 h-1 bg-color_primary origin-center ${
                  pathname.startsWith(item.href)
                    ? ""
                    : "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                }`}
              ></div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
