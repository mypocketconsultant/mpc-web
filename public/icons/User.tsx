import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeColor?: string;
};

export const UserIcon: React.FC<SvgComponentProps> = ({
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
        fillRule="evenodd"
        d="M20.417 2.583c3.771 0 5.657 0 6.828 1.172 1.172 1.171 1.172 3.057 1.172 6.828v9.834c0 3.771 0 5.657-1.172 6.828-1.171 1.172-3.057 1.172-6.828 1.172h-9.834c-3.771 0-5.657 0-6.828-1.172-1.172-1.171-1.172-3.057-1.172-6.828v-9.834c0-3.771 0-5.657 1.172-6.828 1.171-1.172 3.057-1.172 6.828-1.172h9.834ZM15.5 19.667a8.751 8.751 0 0 0-8.452 6.485 1 1 0 0 0 1.932.518 6.75 6.75 0 0 1 10.63-3.609 6.75 6.75 0 0 1 2.41 3.609 1.001 1.001 0 0 0 1.932-.518 8.75 8.75 0 0 0-8.452-6.485Zm0-12.917a4.875 4.875 0 1 0 0 9.75 4.875 4.875 0 0 0 0-9.75Zm0 2a2.875 2.875 0 1 1 0 5.75 2.875 2.875 0 0 1 0-5.75Z"
        clipRule="evenodd"
      />
      <rect
        width={24.833}
        height={24.833}
        x={3.083}
        y={3.083}
        stroke={strokeColor || color}
        rx={3.5}
      />
    </svg>
  );
};

