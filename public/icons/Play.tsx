import * as React from "react";

export const PlayIcon = ({ size = 9, color = "#222", ...props }) => {
  // Maintain original aspect ratio (6:9)
  const width = (6 / 9) * size;
  const height = size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      {...props}
    >
      <path
        fill={color}
        d="M5.77 3.901 1.312.187A.8.8 0 0 0 0 .802v6.583A.8.8 0 0 0 1.312 8L5.77 4.286a.25.25 0 0 0 0-.385Z"
      />
    </svg>
  );
};

