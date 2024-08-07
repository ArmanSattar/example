interface UserActionProps {
  title: string;
  subtitle?: string;
  svgOn: string;
  svgOff?: string;
}

export const UserAction: React.FC<UserActionProps> = ({ title, svgOn, svgOff, subtitle }) => {
  return (
    <div className="flex flex-col items-center">
      svgOn
      <div className="text-white text-sm mt-2">{title}</div>
      <div className="text-gray-400 text-xs mt-1">{subtitle}</div>
    </div>
  );
};
