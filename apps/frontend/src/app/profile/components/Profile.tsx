import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext'; 

interface UserInfoProps {
  username: string;
}

const Profile: React.FC<UserInfoProps> = ({ username }) => {
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [showSelfExcludePopup, setShowSelfExcludePopup] = useState(false);
  const [showChangeUsernamePopup, setShowChangeUsernamePopup] = useState(false);
  const [showChangeProfilePicturePopup, setShowChangeProfilePicturePopup] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [excludeDuration, setExcludeDuration] = useState('1 week');
  const [isMuted, setIsMuted] = useState(false);
  const [profilePicture, setProfilePicture] = useState('/header-image.png');

  useEffect(() => {
    if (user) {
      setCurrentUsername(user.username);
      setNewUsername(user.username);
      setIsMuted(user.muteAllSounds)
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSelfExclude = () => {
    setShowSelfExcludePopup(true);
  };

  const handleConfirmExclusion = () => {
    console.log(`Self-excluded for ${excludeDuration}`);
    setShowSelfExcludePopup(false);
  };

  const handleChangeUsername = () => {
    setNewUsername(currentUsername);
    setShowChangeUsernamePopup(true);
  };

  const handleConfirmChangeUsername = async () => {
    setCurrentUsername(newUsername);
    setShowChangeUsernamePopup(false);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API_URL}/user`,
        {
          updateFields: {
            username: newUsername,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, 
          },
        }
      );

      if (response.status === 200) {
        updateUser({username: newUsername})
        toast.success("Successfully updated username!");
      } else {
        toast.error("Something went wrong...");
      }
    } catch (error) {
      toast.error('Failed to update username');
    }

    setShowChangeUsernamePopup(false);
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API_URL}/user`,
        {
          updateFields: {
            muteAllSounds: !isMuted,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        updateUser({muteAllSounds: !isMuted})
        toast.success(`Successfully turned sounds ${isMuted ? "on" : "off"}!`);
      } else {
        toast.error("Something went wrong...");
      }
    } catch (error) {
      toast.error('Failed to change the sound setting');
    }

  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newProfilePicture = URL.createObjectURL(event.target.files[0]);
      setProfilePicture(newProfilePicture);
      setShowChangeProfilePicturePopup(false);
      console.log('Profile picture changed');
    }
  };

  return (
    <div className="w-full mx-auto my-4 p-6 rounded-lg relative">
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 ease-in-out"
          onClick={() => setShowChangeProfilePicturePopup(true)}
        >
          Change Profile Picture
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
        <div className="flex items-center">
          <input
            type="text"
            value={currentUsername}
            readOnly
            className="block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 ease-in-out"
            onClick={handleChangeUsername}
          >
            Change
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Coupon Code</label>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Enter here..."
            className="block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300 ease-in-out">Submit</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center">
          <span className="text-white mr-4">Mute all sounds</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isMuted} onChange={toggleMute} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <div className="hidden mt-6 flex space-x-4">
        <button className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition duration-300 ease-in-out flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Link Discord
        </button>
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 ease-in-out"
          onClick={handleSelfExclude}
        >
          Self Exclude
        </button>
      </div>

      {/* Self-exclusion popup */}
      {showSelfExcludePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Self Exclusion</h2>
            <p className="text-gray-300 mb-4">How long would you like to self-exclude?</p>
            <select
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              value={excludeDuration}
              onChange={(e) => setExcludeDuration(e.target.value)}
            >
              <option value="1 week">1 week</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300 ease-in-out"
                onClick={() => setShowSelfExcludePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 ease-in-out"
                onClick={handleConfirmExclusion}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username popup */}
      {showChangeUsernamePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Change Username</h2>
            <input
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300 ease-in-out"
                onClick={() => setShowChangeUsernamePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out"
                onClick={handleConfirmChangeUsername}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Profile Picture popup */}
      {showChangeProfilePicturePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Change Profile Picture</h2>
            <input
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300 ease-in-out"
                onClick={() => setShowChangeProfilePicturePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out"
                onClick={() => {
                  setShowChangeProfilePicturePopup(false);
                  console.log('Profile picture upload confirmed');
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
