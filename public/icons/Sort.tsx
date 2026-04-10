import * as React from "react";

type IconProps = {
  size?: number;       
  color?: string;      
};

const SortIcon: React.FC<IconProps> = ({ size = 24, color = "#33363F", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeWidth={2}
      d="M5 7h14M5 12h10M5 17h6"
    />
  </svg>
);

export default SortIcon;