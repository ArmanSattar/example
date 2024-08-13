import React from "react";
import { cn } from "../cases/[id]/utils";

interface SpinnerProps {
  size: "small" | "medium" | "large" | "xlarge";
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size, color }) => {
  const sizeClasses = {
    small: "scale-50",
    medium: "scale-75",
    large: "scale-100",
    xlarge: "scale-110",
  };

  return (
    <div className={cn(`lds-spinner ${sizeClasses[size]}`, color)}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
