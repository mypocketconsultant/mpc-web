import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;         
  fillColor?: string;    
  strokeColor?: string;  
};

export const HelpIndicator : React.FC<SvgComponentProps> = ({
  size = 10,
  fillColor = "#FFED90",
  strokeColor = "#977400",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip)">
        <rect width={10} height={10} fill={fillColor} rx={5} />
        <path
          stroke={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 9.643A4.643 4.643 0 1 0 5 .357a4.643 4.643 0 0 0 0 9.286ZM3.929 7.143h2.143"
        />
        <path
          stroke={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 7.143v-2.5h-.714M5 3.035a.179.179 0 0 1 0-.357M5 3.035a.179.179 0 0 0 0-.357"
        />
      </g>
      <defs>
        <clipPath id="clip">
          <rect width={10} height={10} fill="#fff" rx={5} />
        </clipPath>
      </defs>
    </svg>
  );
};

