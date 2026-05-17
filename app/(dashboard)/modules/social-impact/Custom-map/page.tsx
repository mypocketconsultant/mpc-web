"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft  } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";

import CustomMap from "../components/CustomMap";


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
         
        

                         
        </div>
       </main>
    </div>
  )
}

export default page