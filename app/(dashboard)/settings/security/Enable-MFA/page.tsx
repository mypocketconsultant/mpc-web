"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import CustomToggle from "@/app/components/CustomToggleButton";
import Modal from "@/app/components/Modal";
import { X } from 'lucide-react';
const page = () => {
    const router = useRouter();
    const [isNotificationsOn, setIsNotificationsOn] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
  return (
     <div className="flex flex-col h-full">
      <SettingsHeader title="Settings" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/settings/security">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[#000000] font-regular">Security/2FA Security</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />

           <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
            <h2 className="text-[#062950] font-bold">Multi-factor authentication (MFA)</h2>
            <div className="mt-4"/>
            <div className="flex flex-col items-end">
           <div className="w-full my-1 ">
  <p className="text-[#062950] font-bold m-0 py-1">Email</p>
  <div className="border border-gray-400 rounded-1xl p-2.5 mt-1 w-full">
    <input
      placeholder="Enter backup email"
      className="w-full border-none outline-none"
    />
  </div>
</div>
  
  <div className="w-full my-1">
  <p className="text-[#062950] font-bold m-0 py-1">Phone Number</p>
  <div className="border border-gray-400 rounded-1xl p-2.5 mt-1 w-full">
    <input
      placeholder="Enter Phone number"
      className="w-full border-none outline-none"
    />
  </div>
</div>
  <div className="w-full flex flex-row justify-between mt-4">
    <p className="text-[#062950] font-bold ">Turn on authentication app</p>
    <CustomToggle enabled={isNotificationsOn} setEnabled={setIsNotificationsOn} />
  </div>
  <div className=" mt-5 flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
  onClick={()=> setIsOpen(true)}
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">
      Save
    </p>
  </div>
</div>
           </div>
            
        
         

        </div>

      </main>
     <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="py-8 px-12">
       <div
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-[#E8E8E8] rounded-full p-2"
            onClick={() => setIsOpen(false)}
          >
            <X  color="#000000"/>
          </div>
        <div className="mt-12">
          <h6 className="text-[#000000] font-bold text-center">MFA authentication</h6>
          <div className="my-6"/>
           <div className="border border-gray-400 rounded-1xl p-2.5 mt-1 w-full">
    <input
      placeholder="Enter the 6-digit code send to your phone number"
      className="w-full border-none outline-none font-regular placeholder-[#8D8D8D] placeholder-sm"
    />
  </div>
<div className="flex justify-center items-center w-full h-full mt-2">
  <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
    onClick={() => setIsOpen(true)}
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">Send</p>
  </button>
</div>
        </div>
       </div>
      </Modal>
    </div>
  )
}

export default page