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
    <header className="text-white top-0 left-0 bg-background w-full border-b-green-400 gradient-border-bottom shadow-2xl sticky z-50 h-20 pr-3">
      <div className="flex justify-between items-center w-full h-full z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center w-[100px] sm:w-[320px] justify-center">
            <Image src="/icons/logo.webp" alt="logo" width={90} height={90} />
          </div>
          <ul className="hidden xl:space-x-8 lg:flex h-full">
            {navLinks.map((navLink, index) => (
              <Link
                key={navLink.href} // Added key prop here
                onClick={() => setNavActiveLink(navLink.href)}
                href={navLink.href}
                className={"h-full flex items-center"}
              >
                <li
                  className="relative flex items-center space-x-3 group hover:cursor-pointer pr-4 first:pl-2 h-full"
                >
                  <div
                    className={`absolute inset-x-0 bottom-0 h-1 rounded-t-md bg-red-500 origin-center ${
                      navLink.href === navActiveLink
                        ? ""
                        : "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                    }`}
                  ></div>
                  <navLink.icon
                    className={`h-6 w-6 text-gray-400 group-hover:text-red-500 duration-75 ${
                      navActiveLink === navLink.href ? "text-red-500" : ""
                    }`}
                  />
                  <span
                    className={`text-gray-400 group-hover:text-white duration-75 ${
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
        <div className="flex space-x-4 item-center h-12">
          {user && <Balance />}
          {user && (
            <button
              className="hidden xl:block bg-custom_gray text-white py-2 px-5 rounded"
              onClick={handleWithdrawClick}
            >
              Withdraw
            </button>
          )}
          {user &&  <UserProfile /> ? (
            <UserProfile />
          ) : (
            <div className="hidden xl:block">
              <CustomWalletMultiButton />
            </div>
          )}
          <Hamburger className={"lg:hidden"} />
        </div>
      </div>
    </header>
  );
};
