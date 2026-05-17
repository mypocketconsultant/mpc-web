import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const HelpCenterIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#33363F",
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
    <circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
    <circle cx={12} cy={18} r={0.5} fill={color} stroke={color} />
    <path
      d="M12 16v-1.419c0-.944.604-1.782 1.5-2.081a2.194 2.194 0 0 0 1.5-2.081v-.513C15 8.3 13.7 7 12.094 7H12a3 3 0 0 0-3 3"
      stroke={color}
      strokeWidth={2}
    />
  </svg>
);

