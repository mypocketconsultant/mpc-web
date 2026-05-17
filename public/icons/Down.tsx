import * as React from "react";

interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;       // width & height
  color?: string;      // fill color
}

 export const DownIcon: React.FC<SvgIconProps> = ({ size = 12, color = "#33363F", ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(size * 10) / 12} // maintain original aspect ratio
      fill="none"
      {...props}
    >
      <path
        fill={color}
        d="M4.894 8.83.254 2.203C-.394 1.275.27 0 1.403 0h8.622c1.133 0 1.796 1.275 1.147 2.203L6.532 8.83a1 1 0 0 1-1.638 0Z"
      />
    </svg>
  );
};

