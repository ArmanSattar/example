import React from "react";
import SoundOn from "../../../../../public/icons/sound-on.svg";
import SoundOff from "../../../../../public/icons/sound-off.svg";
import { RootState } from "../../../../store";
import { useDispatch, useSelector } from "react-redux";
import { toggleSoundOn } from "../../../../store/slices/demoSlice";

export const SoundToggle = () => {
  const isSoundOn = useSelector((state: RootState) => state.demo.soundOn);
  const dispatch = useDispatch();

  return (
    <div
      className={
        "flex items-center justify-between space-x-2 cursor-pointer group hover:bg-color_gray_3 duration-250 ease-in-out transition rounded-md px-2 py-3"
      }
      onClick={() => {
        dispatch(toggleSoundOn());
      }}
    >
      {!isSoundOn ? (
        <SoundOn className={"w-6 h-6 text-gray-400 group-hover:text-gray-300"} />
      ) : (
        <SoundOff className={"w-6 h-6 text-gray-400 group-hover:text-gray-300"} />
      )}
      <span className="text-gray-400 group-hover:text-gray-300 whitespace-nowrap">
        {!isSoundOn ? "Sound Off" : "Sound On"}
      </span>
    </div>
  );
};
