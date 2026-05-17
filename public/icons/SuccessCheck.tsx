import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  checkColor?: string;
}

const SuccessCheckIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#353445",
  checkColor = "#fff",
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
    <g clipPath="url(#a)">
      {/* Background Circle - Uses the 'color' prop */}
      <path fill={color} d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z" />
      
      {/* Checkmark - Uses the 'checkColor' prop */}
      <path
        fill={checkColor}
        d="m18.506 10.03-6.114 6.414a1.793 1.793 0 0 1-1.29.556h-.008a1.796 1.796 0 0 1-1.287-.544l-3.243-3.34a1.793 1.793 0 1 1 2.572-2.495l1.943 2.002 4.826-5.065a1.795 1.795 0 0 1 2.601 2.471Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default SuccessCheckIcon;