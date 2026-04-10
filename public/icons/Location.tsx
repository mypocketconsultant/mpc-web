import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;       // width and height
  color?: string;      // stroke color
};

export const LocationIcon: React.FC<SvgComponentProps> = ({
  size = 14,
  color = "#000",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 14 14"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.5 5c0 3-4.5 6.5-4.5 6.5S2.5 8 2.5 5C2.5 2.549 4.549.5 7 .5s4.5 2.049 4.5 4.5Z"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM11.077 10H12l1.5 3.5H.5L2 10h.923"
    />
  </svg>
);

