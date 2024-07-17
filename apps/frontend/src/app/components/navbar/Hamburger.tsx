import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const toggleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuOptions: MenuOption[] = [
    { label: "Cases", onClick: () => router.push("/cases") },
    { label: "Rewards", onClick: () => router.push("/rewards") },
    { label: "Leaderboards", onClick: () => router.push("/leaderboards") },
    { label: "Withdraw", onClick: () => console.log("Contact clicked") },
  ];

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      <button
        className={`text-white w-12 h-12 relative focus:outline-none bg-custom_gray rounded-md ${className}`}
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
        <div className="absolute right-0 top-full mt-1 w-36 bg-custom_gray shadow-lg xl:hidden rounded-md z-50">
          {menuOptions.map((option, index) => (
            index !== 3 ? 
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
            >
              {option.label}
            </button>
            :
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setOpen(false);
              }}
              className="block sm:hidden w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"

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