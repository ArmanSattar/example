import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../cases/[id]/utils";
import { useDispatch } from "react-redux";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../../store/slices/navbarSlice";

interface HamburgerButtonProps {
  className: string;
}

interface MenuOption {
  label: string;
  onClick: () => void;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const toggleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuOptions: MenuOption[] = [
    { label: "Cases", onClick: () => router.push("/cases") },
    { label: "Rewards", onClick: () => router.push("/rewards") },
    { label: "Leaderboards", onClick: () => router.push("/leaderboards") },
    { label: "Withdraw", onClick: () => dispatch(toggleWithdrawClicked()) },
    { label: "Deposit", onClick: () => dispatch(toggleDepositClicked()) },
  ];

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      <button
        className={cn(
          `text-white w-10 h-10 md:h-12 md:w-12 relative focus:outline-none hover:bg-color_gray_3 transition-colors duration-200 ease-in-out rounded-md`,
          className
        )}
        onClick={toggleOpen}
      >
        <span className="sr-only">Open main menu</span>
        <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span
            aria-hidden="true"
            className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
              open ? "rotate-45" : "-translate-y-1.5"
            }`}
          ></span>
          <span
            aria-hidden="true"
            className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
              open ? "opacity-0" : ""
            }`}
          ></span>
          <span
            aria-hidden="true"
            className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
              open ? "-rotate-45" : "translate-y-1.5"
            }`}
          ></span>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-color_gray_2 shadow-lg xl:hidden rounded-md z-50">
          {menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-color_gray_3 ${
                index === 0
                  ? "rounded-t-md"
                  : index === menuOptions.length - 1
                  ? "rounded-b-md"
                  : ""
              } `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HamburgerButton;
