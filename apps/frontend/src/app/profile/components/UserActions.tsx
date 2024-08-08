"use client";

import UserOutline from "../../../../public/icons/user-outline.svg";
import Twitter from "../../../../public/icons/twitter.svg";
import Logout from "../../../../public/icons/logout.svg";
import Discord from "../../../../public/icons/discord.svg";
import Coupon from "../../../../public/icons/coupon.svg";
import SoundOff from "../../../../public/icons/sound-off.svg";
import SoundOn from "../../../../public/icons/sound-on.svg";
import Time from "../../../../public/icons/time.svg";
import { useAuth } from "../../context/AuthContext";
import { UserAction } from "./UserAction";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSoundOn } from "../../../store/slices/demoSlice";
import { RootState } from "../../../store";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const UserActions = () => {
  const { user, updateUser } = useAuth();
  const [showSelfExcludePopup, setShowSelfExcludePopup] = useState(false);
  const [showChangeUsernamePopup, setShowChangeUsernamePopup] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [excludeDuration, setExcludeDuration] = useState("1 week");
  const [isMuted, setIsMuted] = useState(false);
  const dispatch = useDispatch();
  const isSoundOn = useSelector((state: RootState) => state.demo.soundOn);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setCurrentUsername(user.username);
      setNewUsername(user.username);
      setIsMuted(user.muteAllSounds);
      if (isSoundOn !== !user.muteAllSounds) dispatch(toggleSoundOn());
    }
  }, [user]);

  const handleSelfExclude = useCallback(() => {
    setShowSelfExcludePopup(true);
  }, []);

  const handleConfirmExclusion = useCallback(() => {
    console.log(`Self-excluded for ${excludeDuration}`);
    setShowSelfExcludePopup(false);
  }, [excludeDuration]);

  const handleChangeUsername = useCallback(() => {
    setNewUsername(currentUsername);
    setShowChangeUsernamePopup(true);
  }, [currentUsername]);

  const handleConfirmChangeUsername = useCallback(async () => {
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        updateUser({ username: newUsername });
        toast.success("Successfully updated username!");
      } else {
        toast.error("Something went wrong...");
      }
    } catch (error) {
      toast.error("Failed to update username");
    }

    setShowChangeUsernamePopup(false);
  }, [newUsername, updateUser]);

  const toggleMute = useCallback(async () => {
    dispatch(toggleSoundOn());

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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        updateUser({ muteAllSounds: !isMuted });
        toast.success(`Successfully turned sounds ${isMuted ? "on" : "off"}!`);
      } else {
        toast.error("Something went wrong...");
      }
    } catch (error) {
      toast.error("Failed to change the sound setting");
    }
  }, [dispatch, isMuted, isSoundOn, updateUser]);

  const actions = useMemo(
    () => [
      {
        title: "Change Username",
        SvgOn: UserOutline,
        svgOnColor: "text-white",
        onClick: () => {
          handleChangeUsername();
        },
      },
      {
        title: "Coupon Code",
        subtitle: "Got a coupon code? Redeem it here",
        SvgOn: Coupon,
        svgOnColor: "text-yellow-500",
        onClick: () => {
          toast.info("Coupon code redemption coming soon!");
        },
      },
      {
        title: "Sound",
        subtitle: "Turn sound on or off",
        SvgOn: SoundOff,
        SvgOff: SoundOn,
        svgOnColor: "text-green-500",
        svgOffColor: "text-red-500",
        isOn: isSoundOn,
        onClick: () => {
          toggleMute();
        },
      },
      {
        title: "Self Exclusion",
        subtitle: "Exclude yourself from playing",
        SvgOn: Time,
        svgOnColor: "text-purple-500",
        onClick: () => {
          handleSelfExclude();
        },
      },
      {
        title: "Twitter",
        subtitle: "Link your twitter account",
        SvgOn: Twitter,
        svgOnColor: "",
        onClick: () => {
          toast.info("Twitter linking coming soon!");
        },
      },
      {
        title: "Discord",
        subtitle: "Link your discord account",
        SvgOn: Discord,
        svgOnColor: "",
        onClick: () => {
          toast.info("Discord linking coming soon!");
        },
      },
      {
        title: "Logout",
        subtitle: "Logout from your account",
        SvgOn: Logout,
        svgOnColor: "text-red-500",
        onClick: () => {
          localStorage.removeItem("token");
          router.refresh();
          router.push("/cases");
        },
      },
    ],
    [isSoundOn, toggleMute]
  );

  if (!user) {
    return null;
  }

  return (
    <div className={"w-full flex flex-col justify-between gap-y-2"}>
      <span className={"uppercase text-lg font-bold text-white"}>Actions</span>
      <div
        className={
          "rounded-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 justify-start gap-4 w-full"
        }
      >
        {actions.map((action, index) => (
          <UserAction
            key={index}
            {...action}
            isOn={action.title === "Sound" ? !user.muteAllSounds : true}
          />
        ))}
      </div>
      {showChangeUsernamePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-color_gray_2 py-6 px-8 rounded-lg border-4 border-color_stroke_1 shadow-lg w-11/12 md:w-1/2 xl:w-1/3 h-auto max-w-4xl transform translate-y-0 flex flex-col items-center justify-between relative gap-y-[2vh]">
            <h2 className="text-xl font-bold text-white mb-4">Change Username</h2>
            <input
              className="rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-400 focus:placeholder:opacity-50 text-white focus:outline-none"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={"New Username"}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition duration-300 ease-in-out"
                onClick={() => setShowChangeUsernamePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition duration-300 ease-in-out"
                onClick={handleConfirmChangeUsername}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSelfExcludePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-color_gray_2 py-6 px-8 rounded-lg border-4 border-color_stroke_1 shadow-lg w-11/12 md:w-1/2 xl:w-1/3 h-auto max-w-4xl transform translate-y-0 flex flex-col items-center justify-between relative gap-y-[2vh]">
            <h2 className="text-xl font-bold text-white mb-4">Self Exclusion</h2>
            <p className="text-gray-300 mb-4">How long would you like to self-exclude?</p>
            <select
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none"
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
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition duration-300 ease-in-out"
                onClick={() => setShowSelfExcludePopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition duration-300 ease-in-out"
                onClick={handleConfirmExclusion}
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
