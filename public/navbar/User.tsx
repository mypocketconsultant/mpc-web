import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

const UserCircleIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#222",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle cx={12} cy={10} r={3} stroke={color} strokeLinecap="round" />
    <circle cx={12} cy={12} r={9} stroke={color} />
    <path
      d="M18 18.706c-.354-1.063-1.134-2.003-2.219-2.673C14.697 15.363 13.367 15 12 15s-2.697.363-3.781 1.033c-1.085.67-1.865 1.61-2.219 2.673"
      stroke={color}
      strokeLinecap="round"
    />
  </svg>
);

export default UserCircleIcon;