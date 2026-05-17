"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft  } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import SortIcon from "@/public/icons/Sort";
import VolunteerList from "../components/VolunteerList";


const page = () => {
  
   const pathname = usePathname();
  
    const router = useRouter();
 
  return (
    <div className="flex flex-col h-full">
       <SettingsHeader title="Social Impact" />
       <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div  className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/social-impact/volunteer-project-finder">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Social Impact/Volunteer Project Finder</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
              <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-2">
                <SortIcon/>
            <p className="font-medium text-[#000000]">Sort by</p>
            </div>
              <div className="border border-[#CFCFCF] flex flex-row items-stretch rounded-xl md:rounded-md overflow-hidden shrink-0 text-[10px] sm:text-xs md:text-sm">
  {/* Left Side (Drafts) */}
   <div className="bg-[#EDE6FF] px-2 py-1 md:px-3 md:py-1.5 flex items-center">
    <p className="text-[#3566A2] font-bold whitespace-nowrap">
      List <span className="hidden sm:inline"> view</span>
    </p>
  </div>
  
  
  {/* Right Side (Published) */}
 <div className="bg-white px-2 py-1 md:px-3 md:py-1.5 flex items-center  border-r border-[#CFCFCF]">
    <p className="text-[#16375F] whitespace-nowrap">
     Map
    </p>
  </div>
</div>
          </div>
          <div className="mt-2">
            <VolunteerList/>
          </div>

                         
        </div>
       </main>
    </div>
  )
}

export default page