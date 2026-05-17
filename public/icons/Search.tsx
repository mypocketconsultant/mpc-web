import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeColor?: string;
};

export const Search: React.FC<SvgComponentProps> = ({
  size = 31,
  color = "#222",
  strokeColor,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 31 31"
      {...props}
    >
      <path
        fill={color}
        d="M14.208 5.167a9.042 9.042 0 1 1 0 18.083 9.042 9.042 0 0 1 0-18.083Z"
      />
      <path
        stroke={strokeColor || color}
        strokeLinecap="round"
        strokeWidth={2}
        d="M25.833 25.833 23.25 23.25"
      />
    </svg>
  );
};

