import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { ProfileComponent } from "../chatbar/ProfileComponent";
import { useDispatch } from "react-redux";
import { resetBalance } from "../../../store/slices/userSlice";
import { resetCaseCarouselState } from "../../../store/slices/caseCarouselSlice";
import { resetDemoState } from "../../../store/slices/demoSlice";

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cleanupState = useCallback(() => {
    dispatch(resetBalance());
    dispatch(resetCaseCarouselState());
    dispatch(resetDemoState());
    console.log("State cleaned up");
  }, [dispatch]);

  if (!user) {
    return null;
  }

  const maxUsernameLength = 10;
  const truncatedUsername =
    user.username.length > maxUsernameLength
      ? user.username.slice(0, maxUsernameLength) + "..."
      : user.username;

  const handleLogout = async () => {
    try {
      cleanupState();
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-center relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-center mt-1 space-x-4 p-2 rounded-lg cursor-pointer hover:scale-[102%] transition-transform duration-200 ease-in-out"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <ProfileComponent level={1} profileImageUrl={user.profileImageUrl} />
      </div>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-background rounded-md shadow-lg py-1 z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-white-700 hover:bg-gray-800"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-white-700 hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
