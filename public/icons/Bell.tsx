import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeColor?: string;
};

export const Bell: React.FC<SvgComponentProps> = ({
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
        d="M15.5 3.875a7.19 7.19 0 0 1 3.143.72 5.583 5.583 0 0 0 4.366 8.731c.052.473.081.725.126.972a8 8 0 0 0 .752 2.228c.122.24.263.473.543.94l.878 1.464c.805 1.342 1.208 2.014.92 2.521-.287.507-1.07.507-2.635.507H7.407c-1.566 0-2.35 0-2.636-.507-.288-.507.116-1.179.921-2.521l.878-1.464c.28-.467.42-.7.543-.94a8 8 0 0 0 .752-2.228c.048-.265.078-.536.138-1.077l.325-2.927A7.216 7.216 0 0 1 15.5 3.875Zm5.521 2.571a7.19 7.19 0 0 1 1.647 3.819 2.582 2.582 0 0 1-1.646-3.819Z"
        clipRule="evenodd"
      />
      <path
        fill={color}
        d="M11.625 21.959a3.874 3.874 0 0 0 6.615 2.74 3.873 3.873 0 0 0 1.135-2.74h-7.75Z"
      />
      <circle
        cx={23.25}
        cy={7.75}
        r={3.083}
        fill={color}
        stroke={strokeColor || color}
      />
    </svg>
  );
};

