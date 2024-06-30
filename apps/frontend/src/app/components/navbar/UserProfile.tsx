import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export const UserProfile: React.FC = () => {
  const { connected } = useWallet();
  const { getUser, logout } = useAuth();  // Changed from getUser to user
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!connected || !getUser) {  // Check if user is null/undefined
    return null;
  }

  // Truncate the username if it's too long
  const maxUsernameLength = 10;
  const truncatedUsername = getUser.username.length > maxUsernameLength 
    ? getUser.username.slice(0, maxUsernameLength) + '...' 
    : getUser.username;

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={"/header-image.png"} 
            alt=""
            layout="fill"
            objectFit="cover"
          />
        </div>
        <span className="text-white font-medium hidden sm:inline">{truncatedUsername}</span>
      </div>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50">
          <Link href="/profile" className="block px-4 py-2 text-sm text-white-700 hover:bg-gray-800">
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