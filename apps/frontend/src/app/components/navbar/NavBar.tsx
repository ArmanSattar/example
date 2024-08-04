"use client";

import Link from "next/link";
import { useState } from "react";
import { UserProfile } from "./UserProfile";
import Hamburger from "./Hamburger";
import CustomWalletMultiButton from "../sign-in/WalletSignIn";
import GamePad from "../../../../public/icons/Gamepad.svg";
import Medal from "../../../../public/icons/Medal.svg";
import Podium from "../../../../public/icons/Podium.svg";
import Case from "../../../../public/icons/Case.svg";
import { Balance } from "./Balance";
import { useDispatch } from "react-redux";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../../store/slices/navbarSlice";
import Image from "next/image";

const navLinks = [
  {
    name: "Games",
    icon: GamePad,
    href: "/games",
  },
  {
    name: "Rewards",
    icon: Medal,
    href: "/rewards",
  },
  {
    name: "Leaderboards",
    icon: Podium,
    href: "/leaderboards",
  },
  {
    name: "Cases",
    icon: Case,
    href: "/cases",
  },
];

const HOME = "/cases";

export const NavBar = () => {
  const [navActiveLink, setNavActiveLink] = useState("/cases");
  // const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const handleWithdrawClick = () => {
    dispatch(toggleWithdrawClicked());
  };

  const handleDepositClick = () => {
    dispatch(toggleDepositClicked());
  };
  const user = true;

  return (
    <header className="text-white top-0 left-0 bg-navbar_bg w-full sticky z-50 h-14 sm:h-16 md:h-20 px-3 lg:pl-0 border-b-[1px] border-color_gray_3">
      <div className="flex justify-between items-center w-full h-full z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex relative items-center w-[60px] sm:w-[80px] lg:w-[320px] h-full justify-center border-r-[0px] lg:border-r-[1px] border-color_gray_3 cursor-pointer">
            <Link onClick={() => setNavActiveLink(HOME)} href={HOME}>
              <Image
                src="/icons/logo.webp"
                alt="logo"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 60px, (max-width: 1024px) 80px, 320px"
              />
            </Link>
          </div>
          <ul className="hidden xl:flex xl:space-x-10 h-full pl-4">
            {navLinks.map((navLink, index) => (
              <Link
                key={navLink.href}
                onClick={() => setNavActiveLink(navLink.href)}
                href={navLink.href}
                className="h-full flex items-center"
              >
                <li className="relative flex flex-col items-center justify-center space-y-1 group hover:cursor-pointer px-2 h-full">
                  <div
                    className={`absolute inset-x-0 bottom-0 h-1 rounded-t-md bg-color_primary origin-center ${
                      navLink.href === navActiveLink
                        ? ""
                        : "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                    }`}
                  ></div>
                  <div
                    className={`group-hover:text-color_primary duration-75 ${
                      navActiveLink === navLink.href ? "text-color_primary" : "text-gray-400"
                    }`}
                  >
                    <navLink.icon />
                  </div>
                  <span
                    className={`text-xs md:text-sm group-hover:color_primary duration-75 uppercase ${
                      navActiveLink === navLink.href ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {navLink.name}
                  </span>
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center gap-x-4">
          {user && (
            <>
              <Balance />
              <button
                className="hidden sm:block text-white py-2 px-2 sm:px-3 uppercase md:px-4 cursor-pointer hover:bg-color_gray_3 duration-250 ease-in-out transition rounded-md text-xs sm:text-sm md:text-base h-10 sm:h-12 "
                onClick={handleWithdrawClick}
              >
                Withdraw
              </button>
              <button
                className="hidden sm:block rounded-md px-6 h-10 sm:h-12 action-btn-green bg-color_secondary"
                onClick={handleDepositClick}
              >
                <span className="text-white font-semibold uppercase">Deposit</span>
              </button>
            </>
          )}
          {user ? <UserProfile /> : <CustomWalletMultiButton />}
          <Hamburger className="xl:hidden" />
        </div>
      </div>
    </header>
  );
};
