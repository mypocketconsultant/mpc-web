import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const CareerAdvisoryIcon: React.FC<IconProps> = ({
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
        d="M19 11V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C17.48 5 16.92 5 15.8 5H7.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C4 6.52 4 7.08 4 8.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.52 17 6.08 17 7.2 17H14M8 13h4M8 9h7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={18} cy={15} r={1} stroke={color} strokeWidth={2} />
      <path
        d="M20 20s-.5-1-2-1-2 1-2 1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};

