import * as React from "react";

interface SvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const SocialImpact = ({ 
  size = 24, 
  color = "#062950", 
  ...props 
}: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24" // Ensures the paths scale with the 'size' prop
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M.94 5.288 4.7 7.313 8.06 6.73a3.824 3.824 0 0 1 3.163.884M19.34 15.913l-5.318 3.777a3.428 3.428 0 0 1-3.916.038L.939 13.479"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m22.975 13.44-3.763 2.57-5.84-4.714-2.147 1.563a2.003 2.003 0 0 1-2.468-3.152l2.236-1.882a5.143 5.143 0 0 1 3.858-1.178l3.486.372 4.638-2.507"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.373 11.308c1.405 1.252 3.398.614 4.139-.408"
    />
  </svg>
);

