"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from "./UserProfile";
import Hamburger from "./Hamburger";
import { CasesIcon, GamesIcon, LeaderboardsIcon, RewardsIcon } from "./NavIcon";
import CustomWalletMultiButton  from "../sign-in/WalletSignIn";
import { Balance } from "./Balance";
import { useDispatch } from "react-redux";
import { toggleWithdrawClicked } from "../../../store/slices/navbarSlice";
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
  const { connected, publicKey } = useWallet();
  const { user, logout } = useAuth(); 
  const dispatch = useDispatch();

  const handleWithdrawClick = () => {
    dispatch(toggleWithdrawClicked());
  };

  return (
    <header className="text-white top-0 left-0 bg-background w-full border-b-green-400 gradient-border-bottom shadow-2xl sticky z-50 h-16 sm:h-20 px-2 sm:px-4">
      <div className="flex justify-between items-center w-full h-full z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center w-[80px] sm:w-[100px] lg:w-[320px] justify-center">
            <Image src="/icons/logo.webp" alt="logo" width={60} height={60} className="sm:w-[90px] sm:h-[90px]" />
          </div>
          <ul className="hidden xl:flex xl:space-x-4 h-full">
  {navLinks.map((navLink, index) => (
    <Link
      key={navLink.href}
      onClick={() => setNavActiveLink(navLink.href)}
      href={navLink.href}
      className="h-full flex items-center"
    >
      <li className="relative flex items-center space-x-1 lg:space-x-2 group hover:cursor-pointer pr-1 lg:pr-2 first:pl-1 h-full">
        <div
          className={`absolute inset-x-0 bottom-0 h-1 rounded-t-md bg-red-500 origin-center ${
            navLink.href === navActiveLink
              ? ""
              : "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
          }`}
        ></div>
        <navLink.icon
          className={`h-4 w-4 md:h-5 md:w-6 lg:h-6 lg:w-6 text-gray-400 group-hover:text-red-500 duration-75 ${
            navActiveLink === navLink.href ? "text-red-500" : ""
          }`}
        />
        <span
          className={`text-xs lg:text-sm text-gray-400 group-hover:text-white duration-75 ${
            navActiveLink === navLink.href ? "text-white" : ""
          }`}
        >
          {navLink.name}
        </span>
      </li>
    </Link>
  ))}
</ul>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && <Balance />}
          {user && (
            <button
            className="hidden sm:block bg-custom_gray text-white py-3 px-3 sm:px-5 rounded text-sm sm:text-base"
            onClick={handleWithdrawClick}
          >
            Withdraw
          </button>
          )}
          {user ? (
            <UserProfile />
          ) : (
            <div className="hidden sm:block">
              <CustomWalletMultiButton />
            </div>
          )}
          <Hamburger className="xl:hidden" />
        </div>
      </div>
    </header>
  );
};