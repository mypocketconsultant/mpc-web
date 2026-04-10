import * as React from "react";

type SvgProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const NotoficationBell: React.FC<SvgProps> = ({
  size = 24,
  color = "#062950",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      {...props}
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.714}
        d="M10.285 22.286h3.429M18.858 9.429a6.857 6.857 0 1 0-13.714 0v6A2.572 2.572 0 0 1 2.572 18H21.43a2.572 2.572 0 0 1-2.571-2.571v-6ZM.857 9.206A10.286 10.286 0 0 1 5.143.857M23.143 9.206A10.284 10.284 0 0 0 18.857.857"
      />
    </svg>
  );
};

