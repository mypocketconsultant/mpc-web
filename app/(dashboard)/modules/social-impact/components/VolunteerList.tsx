"use client";

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { LocationIcon } from '@/public/icons/Location'
import { useState } from 'react';

interface VolunteerListProps {
  visible: () => void;
}

const VolunteerList = ({ visible }: VolunteerListProps) => {
  const volunteerData = [
    {
    title: "Volunteers at Rego Park",
    category: "Education",
    hours: "4 hours/week",
    location: "Forest Hills",
  },
   {
    title: "Volunteers at Rego Park",
    category: "Education",
    hours: "4 hours/week",
    location: "Forest Hills",
  },
  
  {
    title: "Volunteers at Woodhaven Blvd",
    category: "Education",
    hours: "4 hours/week",
    location: "Woodhaven Blvd",
     visiblity: true
  },

];
 
  return (
    <div className="w-full bg-[#FCFCFF] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
     <h4 className='text-[#000000] font-bold text-left'>Volunteer Lists</h4>
      <div className='space-y-2 pt-2'>
      {volunteerData.map((item, index) => (
  <div
    key={index}
    className="w-full bg-[#FCFCFF] p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50"
  >
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:justify-between">
      
      <div>
        <p className="text-[#062950] font-medium">{item.title}</p>

        <p className="pt-2">
          📓{" "}
          <span className="text-[#300878] font-bold">
            {item.category}
          </span>
        </p>

        <p className="text-[#000000] font-regular py-2">
          {item.hours}
        </p>

        <div className="flex flex-row gap-4 items-center">
          <LocationIcon />
          
          <p className="text-[#062950] font-medium">
            {item.location}
          </p>

          {/* keep button static */}
          {item.visiblity && (
            <div className="flex flex-row gap-1 items-center justify-center px-2 py-1 w-fit rounded-[10px] bg-[#EDE6FF]">
            <p className="text-xs sm:text-sm text-[#062950] m-0 whitespace-nowrap font-medium">
              See in map
            </p>
            <ChevronRight color="#062950" />
          </div>
          )}
        </div>
      </div>

      {/* Buttons (unchanged) */}
      <div className="flex flex-row gap-4">
        <div 
        onClick={visible}
        className="flex items-center justify-center px-4 py-2 w-fit rounded-[10px] bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] cursor-pointer">
          <p className="text-xs sm:text-sm text-white m-0 whitespace-nowrap">
            View details
          </p>
        </div>

        <div className="flex items-center justify-center px-4 py-2 w-fit rounded-[10px] bg-[#EDE6FF] cursor-pointer">
          <p className="text-xs sm:text-sm text-[#16375F] m-0 whitespace-nowrap">
            Save
          </p>
        </div>
      </div>

    </div>
  </div>
))}
      </div>
      
    </div>
  )
}

export default VolunteerList