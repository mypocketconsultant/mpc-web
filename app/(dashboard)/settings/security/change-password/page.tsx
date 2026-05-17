"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
const page = () => {
     const router = useRouter();
  return (
     <div className="flex flex-col h-full">
      <SettingsHeader title="Settings" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/settings/security">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[#000000] font-regular">Security/Password security</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />

           <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
            <h2 className="text-[#062950] font-bold">Change password</h2>
            <div className="mt-2"/>
            <div className="flex flex-col items-end">
  <div className="border border-gray-400 rounded-1xl p-2.5 my-3 w-full">
    <input
      placeholder="Old Password"
      className="w-full border-none outline-none"
    />
  </div>
  
  <div className="border border-gray-400 rounded-1xl p-2.5 my-3 w-full">
    <input
      placeholder="New Password"
      className="w-full border-none outline-none"
    />
  </div>
  
  <div className="border border-gray-400 rounded-1xl p-2.5 my-3 w-full">
    <input
      placeholder="Confirm New Password"
      className="w-full border-none outline-none"
    />
  </div>

  {/* Save Button aligned to the end */}
  <div className="flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]">
    <p className="text-xs sm:text-base text-white m-0 font-medium">
      Save
    </p>
  </div>
</div>
           </div>
            
        
         

        </div>

      </main>
     
    </div>
  )
}

export default page