import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const PricingIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
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
    <path
      d="M18.237 2.64H5.763a1.833 1.833 0 0 0-1.457.789l-3.118 4.32A1.8 1.8 0 0 0 1.29 9.96l9.355 10.783a1.712 1.712 0 0 0 2.708 0L22.709 9.96a1.801 1.801 0 0 0 .103-2.211l-3.118-4.32a1.832 1.832 0 0 0-1.457-.789Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m11.109 2.623-4.183 6.48L12 21.36M12.943 2.623l4.166 6.48L12 21.36M.891 9.103H23.11"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

