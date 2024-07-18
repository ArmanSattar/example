interface SpinnerProps {
  size: "small" | "medium" | "large" | "xlarge";
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size, color }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-r-2 border-b-2 ${sizeClasses[size]} ${color}`}
      ></div>
    </div>
  );
};
