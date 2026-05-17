import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const StudysupportIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#062950",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="m6 13-3-2 9-5 9 5-3 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 14a1 1 0 1 0 2 0h-2Zm1-7h-1v7h2V7h-1Z" fill={color} />
      <path
        d="M6 13v4l6 2.5 6-2.5v-4s-1-2-6-2-6 2-6 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

