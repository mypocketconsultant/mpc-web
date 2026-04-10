"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import CustomRadioButton from "@/app/components/CustomRadioButton";
const page = () => {
    const router = useRouter();
    const [selected, setSelected] = useState<string>("");
  return (
     <div className="flex flex-col h-full">
      <SettingsHeader title="Settings" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/settings/security">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[#000000] font-regular">Security/Notifications & Alerts</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />

           <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
            <h2 className="text-[#062950] font-bold">Notification preferences</h2>
            <div className="my-3">
              <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="New Device"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    New device login alerts
  </p>
            </div>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="Password changes"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    Password changes
  </p>
            </div>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="Security updates"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    Security updates
  </p>
            </div>
            </div>
           <div className="my-3">
             <h2 className="text-[#062950] font-bold">Channels:</h2>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="Email"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    Email
  </p>
            </div>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="In-app"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    In-app
  </p>
            </div>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="Push notifications"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    Push notifications
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