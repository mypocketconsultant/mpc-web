import * as React from "react";

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number;          
  fillColor?: string;      
  strokeColor?: string;    
}

const CheckIcon: React.FC<Props> = ({
  size = 24,
  fillColor = "#43A247",
  strokeColor = "#fff",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <g clipPath="url(#clip0)">
      <path
        fill={fillColor}
        d="M18 .857H6A5.143 5.143 0 0 0 .855 6v12A5.143 5.143 0 0 0 6 23.143h12A5.143 5.143 0 0 0 23.142 18V6A5.143 5.143 0 0 0 18 .857Z"
      />
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.714}
        d="m17 8.143-6.857 8.571-3.429-2.571"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default CheckIcon;