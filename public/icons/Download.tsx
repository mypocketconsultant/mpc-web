

import * as React from "react";

type DownloadProps = React.SVGProps<SVGSVGElement> & {
  size?: number;      
  color?: string;     
  rotate?: number;   
};

export const Download: React.FC<DownloadProps> = ({
  size = 20,
  color = "#062950",
  rotate = 0,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
      {...props}
    >
      <g
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.429}
      >
        <path d="M18.571 9.286v8.333c0 .253-.09.495-.25.674a.816.816 0 0 1-.607.279H2.286a.816.816 0 0 1-.606-.28 1.009 1.009 0 0 1-.251-.673V2.381c0-.252.09-.495.25-.673a.816.816 0 0 1 .607-.28h7" />
        <path d="m15.714 1.429 2.857 2.857-2.857 2.857" />
        <path d="M10 13.571V10a5.714 5.714 0 0 1 5.714-5.714h2.679" />
      </g>
    </svg>
  );
};