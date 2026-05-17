
"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

interface HeroCardProps {
  image: StaticImageData | string;
  title: string;
  description: string;
}

const HeroCard: React.FC<HeroCardProps> = ({
  image,
  title,
  description,
}) => {
  return (
    <div className="border border-[#1B1B1B14] shadow-[0px_4px_12px_0px_#24272B4D] p-4 rounded-lg">
      <Image
        src={image}
        alt={title}
        width={250}
        height={150}
        className="w-[250px] h-[150px] rounded-[26px] object-cover"
      />

      <div className="my-6" />

      <div className="py-2 ">
        <h5 className="font-bold text-[#010D3E]">{title}</h5>
        {/* <p className="text-[#010D3E] font-medium pt-2">
          {description}
        </p> */}
        <p className="text-[#010D3E] font-medium pt-2 max-w-[220px] sm:max-w-[300px]">
  {description}
</p>
      </div>
    </div>
  );
};

export default HeroCard;