import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

export const FinancialLiteracyIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        clipPath="url(#clip-a)"
      >
        <path d="M21.429.857H2.57c-.946 0-1.714.768-1.714 1.714v10.286c0 .947.768 1.714 1.714 1.714H21.43c.946 0 1.714-.767 1.714-1.714V2.571c0-.946-.768-1.714-1.714-1.714Z" />
        <path d="M12 10.286a2.571 2.571 0 1 0 0-5.143 2.571 2.571 0 0 0 0 5.143ZM2.571 18.857H21.43M4.286 23.143h15.428M4.757 8.143a.429.429 0 0 1 0-.857M4.757 8.143a.429.429 0 0 0 0-.857M19.243 8.143a.429.429 0 0 1 0-.857M19.243 8.143a.429.429 0 1 0 0-.857" />
      </g>

      <defs>
        <clipPath id="clip-a">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

