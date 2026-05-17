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
                <span className="text-[#000000] font-regular">Security / Terms of Service</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
           <div 
           className="
           w-full  
           mx-auto max-h-[400px] h-screen
           overflow-y-auto pr-2
          /* 1. Increase the total scrollbar area width (the white part) */
  [&::-webkit-scrollbar]:w-4 
  
  /* 2. Set the track background to white */
  [&::-webkit-scrollbar-track]:bg-white
  
  /* 3. Style the thumb with a 'border' to make it look thinner than the track */
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  [&::-webkit-scrollbar-thumb]:border-[4px] 
  [&::-webkit-scrollbar-thumb]:border-solid 
  [&::-webkit-scrollbar-thumb]:border-white
  
  /* 4. Hover effect */
  hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
           
           ">
            <h2 className="text-[#062950] font-bold my-4">Terms of Service</h2>
            <h4 className="text-[#062950] font-regular">Effective Date: [Insert Date]</h4>
            <h4 className="text-[#062950] font-regular">Last Updated: [Insert Date]</h4>

           <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal my-4">
  Welcome to My Pocket Consultant. These Terms of Service (“Terms”) govern your access to and use of our website, AI-powered  {"\n"} tools, advisory modules, and related services (collectively, the “Service”).
 
  {"\n"} By creating an account or using the Service, you agree to these Terms. If you do not agree, please do not use the Service.
</h4>
 <div  className="my-4">
  <h2 className="text-[#062950] font-bold">1. Eligibility</h2>
   <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
  You must be at least 18 years old (or the legal age in your jurisdiction) to use this Service. By using the platform, you confirm that you  {"\n"}
  meet this requirement.
</h4>
 </div>
 <div  className="my-4">
  <h2 className="text-[#062950] font-bold">2. Account Registration</h2>
   <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
   To access certain features, you must create an account.
</h4>
 <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal"> You agree to:</h4>
 <ul className="list-disc ml-5 space-y-1.5 marker:text-[10px] mt-1">
  <li className="text-[#062950] text-sm font-normal leading-tight">
   Provide accurate and complete information
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
    Keep your login credentials secure
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
   Notify us immediately of unauthorized access
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
    Be responsible for all activity under your accoun
  </li>
</ul>
<h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal mt-1"> We reserve the right to suspend or terminate accounts that violate these Terms.</h4>

 </div>
 <div className="my-4">
  <h2 className="text-[#062950] font-bold">3. Description of Services</h2>
   <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
  My Pocket Consulatant provides AI-assisted advisory tools, including but not limited to:
</h4>
<ul className="list-disc ml-5 space-y-1.5 marker:text-[10px] mt-1">
  <li className="text-[#062950] text-sm font-normal leading-tight">
   Life Advisory
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
    Study Advisory
  </li>
  
</ul>
 </div>
 
           </div>
            
        
         

        </div>

      </main>
     
    </div>
  )
}

export default page