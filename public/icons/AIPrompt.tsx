import * as React from "react";

export const AIPrompt = ({ size = 16, color = "#000", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <g
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      clipPath="url(#clip)"
    >
      <path d="m7.926 14.202-3 .26.26-3 6.24-6.2a1 1 0 0 1 1.43 0l1.27 1.28a1.001 1.001 0 0 1 0 1.42l-6.2 6.24ZM1.841 4.972c-.35-.061-.35-.565 0-.626A3.176 3.176 0 0 0 4.4 1.896l.021-.097c.076-.346.57-.349.649-.002l.025.112a3.193 3.193 0 0 0 2.566 2.436c.353.06.353.567 0 .629a3.193 3.193 0 0 0-2.566 2.435l-.025.113c-.08.346-.573.344-.649-.003L4.4 7.422a3.176 3.176 0 0 0-2.559-2.45Z" />
    </g>
    <defs>
      <clipPath id="clip">
        <path fill="#fff" d="M1 1h14v14H1z" />
      </clipPath>
    </defs>
  </svg>
);

