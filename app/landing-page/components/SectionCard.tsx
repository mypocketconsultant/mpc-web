

import React from 'react'
import Image from 'next/image'
import SuccessCheckIcon from '@/public/icons/SuccessCheck'
import { ArrowRight } from 'lucide-react';

interface SectionCardProps {
  backgroundGradient: string;
  borderColor: string;
  tagIcon: string;
  tagText: string;
  title: React.ReactNode;
  features: string[];
  buttonText: string;
  imageSrc: string;
  imageAlt?: string;
  // New Prop: defaults to 'right' (text first, image second)
  imagePosition?: 'left' | 'right'; 
}

const SectionCard: React.FC<SectionCardProps> = ({
  backgroundGradient,
  borderColor,
  tagIcon,
  tagText,
  title,
  features,
  buttonText,
  imageSrc,
  imageAlt = "Feature Image",
  imagePosition = 'right' // Default value
}) => {
  // Logic to determine flex direction based on prop
  const isImageLeft = imagePosition === 'left';

  return (
    <div 
      style={{ 
        background: backgroundGradient, 
        borderColor: borderColor 
      }}
      className={`border-[0px] p-6 md:p-12 flex flex-col  justify-center items-center gap-8 rounded-2xl
        ${isImageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'}
      `}
    >
      {/* Content Container (Text/CTA) */}
      <div className={`flex-1 max-w-xl w-full ${isImageLeft ? 'lg:text-left' : ''}`}>
        {/* Tag */}
        <div className="inline-flex flex-row rounded-full py-2 px-4 gap-2 border border-[#E2E8F0] bg-[#FFFFFF] items-center w-fit">
          <Image
            src={tagIcon}
            alt="icon"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <p className="font-semibold text-black text-sm">{tagText}</p>
        </div>

        {/* Title */}
        <h4 className='text-[#0F172A] font-bold text-[24px] md:text-[28px] leading-tight my-6'>
          {title}
        </h4>

        <div className='flex flex-col space-y-6'>
          {/* Features List */}
          <div className='flex flex-col space-y-4'>
            {features.map((feature, index) => (
              <div key={index} className='flex flex-row gap-3 items-start'>
                <div className="shrink-0 mt-1">
                  <SuccessCheckIcon size={18} color="black" checkColor="#FFFFFF"/>
                </div>
                <p className='text-[#0F172A] font-medium text-[14px] leading-[25px] w-[70%]'>
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="inline-flex self-start w-fit bg-[#0F172A] rounded-md gap-3 items-center px-6 py-3 cursor-pointer mt-4 hover:bg-slate-800 transition-colors">
            <p className="text-white font-bold whitespace-nowrap">
              {buttonText}
            </p>
            <ArrowRight size={20} color="#FFFFFF" />
          </div>
        </div>
      </div>

      {/* Hero Image Container */}
      <div className={`flex-1 flex items-center justify-center ${isImageLeft ? 'lg:justify-start' : 'lg:justify-end'}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={454}
          height={482}
          className="w-full max-w-[250px] h-auto object-contain"
        />
      </div>
    </div>
  )
}

export default SectionCard;