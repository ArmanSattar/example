import React from "react";
import { Spinner } from "./Spinner";

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Spinner size="large" color="text-white" />
    </div>
  );
};

export default LoadingOverlay;
