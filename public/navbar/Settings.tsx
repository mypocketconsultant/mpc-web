import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const SettingsIcon: React.FC<IconProps> = ({
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
        d="M11.212 3.25a2.001 2.001 0 0 1 1.576 0l5.914 2.534A2.001 2.001 0 0 1 19.9 7.871l-.613 4.903a7.001 7.001 0 0 1-2.465 4.51l-3.54 2.95a2 2 0 0 1-2.561 0l-3.541-2.95a7.001 7.001 0 0 1-2.465-4.51L4.1 7.871a2.001 2.001 0 0 1 1.197-2.087l5.914-2.534Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="m9 12 2.569 2.569a.5.5 0 0 0 .77-.077L16 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};
