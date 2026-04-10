import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const FaithIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#33363F",
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
      <path d="M12 6V19" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M21 6V19" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M3 6V19" stroke={color} strokeWidth={2} strokeLinecap="round" />

      <path
        d="M21 19C21 19 20 17 16.5 17C13 17 12 19 12 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M12 19C12 19 11 17 7.5 17C4 17 3 19 3 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <path
        d="M21 6C21 6 20 4 16.5 4C13 4 12 6 12 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M12 6C12 6 11 4 7.5 4C4 4 3 6 3 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};

