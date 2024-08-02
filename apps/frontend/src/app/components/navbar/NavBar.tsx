"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserProfile } from "./UserProfile";
import Hamburger from "./Hamburger";
import { CasesIcon, GamesIcon, LeaderboardsIcon, RewardsIcon } from "./NavIcon";
import CustomWalletMultiButton from "../sign-in/WalletSignIn";
import { Balance } from "./Balance";
import { useDispatch } from "react-redux";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../../store/slices/navbarSlice";
import Image from "next/image";

const navLinks = [
  {
    name: "Games",
    icon: GamesIcon,
    href: "/games",
  },
  {
    name: "Rewards",
    icon: RewardsIcon,
    href: "/rewards",
  },
  {
    name: "Leaderboards",
    icon: LeaderboardsIcon,
    href: "/leaderboards",
  },
  {
    name: "Cases",
    icon: CasesIcon,
    href: "/cases",
  },
];

export const NavBar = () => {
  const [navActiveLink, setNavActiveLink] = useState("/cases");
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const handleWithdrawClick = () => {
    dispatch(toggleWithdrawClicked());
  };

  const handleDepositClick = () => {
    dispatch(toggleDepositClicked());
  };

  return (
    <header className="text-white top-0 left-0 bg-navbar_bg w-full sticky z-50 h-14 sm:h-16 md:h-20 px-3 lg:pl-0 border-b-[1px] border-color_gray_3">
      <div className="flex justify-between items-center w-full h-full z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center w-[60px] sm:w-[80px] lg:w-[320px] justify-center border-r-[1px] border-color_gray_3">
            <Image
              src="/icons/logo.webp"
              alt="logo"
              width={48}
              height={48}
              className="sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px]"
            />
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
                  <navLink.icon
                    className={`h-4 w-4 md:h-6 md:w-6 group-hover:text-color_primary duration-75 ${
                      navActiveLink === navLink.href ? "text-color_primary" : "text-white"
                    }`}
                  />
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
          {user && <Balance />}
          {user && (
            <>
              <button
                className="hidden sm:block text-white py-2 px-2 sm:px-3 uppercase md:px-4 cursor-pointer hover:bg-color_gray_3 duration-250 ease-in-out transition rounded-md text-xs sm:text-sm md:text-base h-12 "
                onClick={handleWithdrawClick}
              >
                Withdraw
              </button>
              <button
                className="rounded-md px-6 h-12 action-btn-green bg-color_secondary"
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
