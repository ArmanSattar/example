"use client";

import UserOutline from "../../../../public/icons/user-outline.svg";
import Coupon from "../../../../public/icons/coupon.svg";
import SoundOff from "../../../../public/icons/sound-off.svg";
import SoundOn from "../../../../public/icons/sound-on.svg";
import Time from "../../../../public/icons/time.svg";
import { useAuth } from "../../context/AuthContext";
import { UserAction } from "./UserAction";

const actions = [
  {
    title: "Change Username",
    svgOn: UserOutline,
  },
  {
    title: "Coupon Code",
    subtitle: "Got a coupon code? Redeem it here",
    svgOn: Coupon,
  },
  {
    title: "Sound",
    subtitle: "Turn sound on or off",
    svgOn: SoundOn,
    svgOff: SoundOff,
  },
  {
    title: "Self Exclusion",
    subtitle: "Exclude yourself from playing",
    svgOn: Time,
  },
];

export const UserActions = () => {
  const { user } = useAuth();

  return (
    <div className={"w-full gap-y-2"}>
      <span className={"uppercase text-lg font-bold text-white"}>Actions</span>
      <div className={"rounded-md grid w-full p-4"}>
        {actions.map((action, index) => (
          <UserAction key={index} {...action} />
        ))}
      </div>
    </div>
  );
};
