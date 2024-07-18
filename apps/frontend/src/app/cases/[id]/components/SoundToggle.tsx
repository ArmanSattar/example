import React, { useEffect } from "react";
import SoundOn from "../../../../../public/icons/sound-on.svg";
import SoundOff from "../../../../../public/icons/sound-off.svg";
import { RootState } from "../../../../store";
import { useDispatch, useSelector } from "react-redux";
import { toggleSoundClicked } from "../../../../store/slices/demoSlice";
import { useAuth } from "../../../context/AuthContext";

export const SoundToggle = () => {
  const soundClicked = useSelector((state: RootState) => state.demo.soundClicked);
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.muteAllSounds && soundClicked) {
      dispatch(toggleSoundClicked());
    }
  }, [user]);

  useEffect(() => {
    if (user && soundClicked === user.muteAllSounds) {
      dispatch(toggleSoundClicked());
    }
  }, [user, soundClicked, dispatch]);

  if (user) {
    return null;
  }

  return (
    <div
      className={"flex items-center justify-between space-x-2 cursor-pointer group"}
      onClick={() => {
        dispatch(toggleSoundClicked());
      }}
    >
      {soundClicked ? (
        <SoundOn className={"w-6 h-6 text-gray-400 group-hover:text-gray-300"} />
      ) : (
        <SoundOff className={"w-6 h-6 text-gray-400 group-hover:text-gray-300"} />
      )}
      <span className="text-gray-400 group-hover:text-gray-300">
        {soundClicked ? "Sound On" : "Sound Off"}
      </span>
    </div>
  );
};
