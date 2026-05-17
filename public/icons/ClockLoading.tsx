import * as React from "react";

type SvgComponentProps = React.SVGProps<SVGSVGElement> & {
  size?: number;       
  strokeColor?: string; 
  fillColor?: string;   
};

export const ClockLoading: React.FC<SvgComponentProps> = ({
  size = 28,
  strokeColor = "#000",
  fillColor = "#000",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      {...props}
    >
      {/* Clock circle */}
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.227 20.899a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"
      />

      {/* Clock hands */}
      <path
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.227 11.899v2.5l2.54 2.96"
      />

      {/* Outer shape */}
      <path
        fill={fillColor}
        d="m3.69 10.5.711.238-.711-.237Zm4.477-5.707-.4-.634.4.634Zm7.082-1.571-.094.744.094-.744Zm6.47 3.278.545-.516-.544.516Zm2.924 6.639-.748.053.748-.053Zm-1.953 6.986-.612-.433.612.433Zm-5.941 4.162.198.723-.198-.723ZM9.822 23.05a.75.75 0 1 0-.612 1.37l.306-.685.306-.685Zm-5.973-5.297.7-.268a10.016 10.016 0 0 1-.148-6.747L3.69 10.5l-.712-.237a11.516 11.516 0 0 0 .17 7.757l.701-.268Zm-.16-7.252.712.237a10.016 10.016 0 0 1 4.166-5.31l-.4-.635-.4-.634a11.516 11.516 0 0 0-4.789 6.105l.712.237Zm4.478-5.708.4.635a10.016 10.016 0 0 1 6.588-1.462l.094-.744.093-.744a11.516 11.516 0 0 0-7.575 1.68l.4.635Zm7.082-1.571-.094.744c2.3.29 4.427 1.367 6.02 3.05l.545-.516.544-.516a11.516 11.516 0 0 0-6.922-3.506l-.093.744Zm6.47 3.278-.544.516a10.016 10.016 0 0 1 2.72 6.176l.748-.053.748-.053a11.516 11.516 0 0 0-3.127-7.102l-.544.516Zm2.924 6.639-.748.053a10.016 10.016 0 0 1-1.817 6.5l.612.433.612.434a11.516 11.516 0 0 0 2.089-7.473l-.748.053Zm-1.953 6.986-.612-.433a10.016 10.016 0 0 1-5.527 3.872l.198.723.198.723a11.516 11.516 0 0 0 6.355-4.451l-.612-.434Zm-5.941 4.162-.198-.723c-2.235.612-4.613.43-6.73-.514l-.305.685-.306.685a11.516 11.516 0 0 0 7.737.59l-.198-.723Z"
      />

      {/* Small circle */}
      <circle
        cx={4}
        cy={18}
        r={1}
        fill="#D9D9D9"
        stroke={strokeColor}
        strokeWidth={2}
      />
    </svg>
  );
};

