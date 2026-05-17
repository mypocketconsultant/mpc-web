import * as React from "react";

interface SvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const BusinessConsultancyIcon = ({ size = 24, color = "#000", ...props }: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24" // Added viewBox to ensure scaling works correctly
    fill="none"
    {...props}
  >
    <g
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#a)"
    >
      <path d="M.857.857v22.286h22.286" />
      <path d="m6 11.143 4.286 4.286 6.857-10.286 6 4.286" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

