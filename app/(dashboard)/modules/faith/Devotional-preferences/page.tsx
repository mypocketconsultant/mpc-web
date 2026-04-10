

"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import { DownIcon } from "@/public/icons/Down";
import CustomRadioButton from "@/app/components/CustomRadioButton";
const page = () => {
     const router = useRouter();
     const [open, setOpen] = useState(false);
      const [trinity, setTrinity] = useState("");
const [christ, setChrist] = useState("");
const [salvation, setSalvation] = useState("");
const [scripture, setScripture] = useState("");
const [resurrection, setResurrection] = useState("");
const [humanity, setHumanity] = useState("");
const [church, setChurch] = useState("");
const [ordinances, setOrdinances] = useState("");
const [holySpirit, setHolySpirit] = useState("");
const [creation, setCreation] = useState("");
  return (
     <div className="flex flex-col h-full">
      <SettingsHeader title="Faith" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/modules/faith/Devotional-planner">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[#000000] font-regular">Faith / Generate Devotional</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />

           <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
            <div className="flex items-center justify-center my-4 px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]">
    <p className="text-xs sm:text-base text-white m-0 font-medium">
      Go!
    </p>
  </div>
            <h5 className="text-[#062950] font-medium">Set devotional preferences</h5>
            <div className="mt-2"/>
            <div className="flex flex-col items-end">
   <div className="relative w-full">
  {/* Trigger */}
  <div
    className="border border-gray-400 p-2.5 my-3 w-full flex flex-row justify-between items-center cursor-pointer rounded-xl"
    onClick={() => setOpen(!open)}
  >
    <h3 className="text-[#062950] font-regular m-0">
      -Select devotional theme-
    </h3>
    <DownIcon />
  </div>

  {/* Dropdown aligned to the right */}
  {open && (
    <div className="absolute top-0 right-0 mt-4 w-100 z-50 border border-gray-200 rounded-xl shadow-lg bg-white p-4 space-y-2">
      <h3 className="text-[#000000] font-bold m-0">
        Select a devotional preference
      </h3>

     <div className="max-h-60 overflow-y-auto pr-2">
      <div className="flex flex-row items-center gap-2 my-5"> 
        <CustomRadioButton value="The Trinity" selectedValue={trinity} onChange={setTrinity} /> 
        <p className="text-[#062950] font-medium leading-none"> The Trinity </p>
         </div> 
         <div className="flex flex-row items-center gap-2 my-5"> 
          <CustomRadioButton value="Deity and Humanity of Christ" selectedValue={christ} onChange={setChrist} /> 
          <p className="text-[#062950] font-medium leading-none"> Deity and Humanity of Christ </p> 
          </div> 
          <div className="flex flex-row items-center gap-2 my-5"> 
            <CustomRadioButton value="Salvation by Grace" selectedValue={salvation} onChange={setSalvation} /> 
            <p className="text-[#062950] font-medium leading-none"> Salvation by Grace </p> 
            </div> 
            <div className="flex flex-row items-center gap-2 my-5"> 
              <CustomRadioButton value="The Authority of Scripture" selectedValue={scripture} onChange={setScripture} /> 
              <p className="text-[#062950] font-medium leading-none"> The Authority of Scripture </p> 
              </div> 
              <div className="flex flex-row items-center gap-2 my-5"> 
                <CustomRadioButton value="The Resurrection and Return of Christ" selectedValue={resurrection} onChange={setResurrection} /> 
                <p className="text-[#062950] font-medium leading-none"> The Resurrection and Return of Christ </p> 
                </div> 
                <div className="flex flex-row items-center gap-2 my-5"> 
                  <CustomRadioButton value="Humanity's Need" selectedValue={humanity} onChange={setHumanity} /> 
                  <p className="text-[#062950] font-medium leading-none"> Humanity's Need </p> 
                  </div> 
                  <div className="flex flex-row items-center gap-2 my-5"> 
                    <CustomRadioButton value="The Church" selectedValue={church} onChange={setChurch} /> 
                    <p className="text-[#062950] font-medium leading-none"> The Church </p> 
                    </div> 
                    <div className="flex flex-row items-center gap-2 my-5"> 
                      <CustomRadioButton value="Ordinances" selectedValue={ordinances} onChange={setOrdinances} /> 
                      <p className="text-[#062950] font-medium leading-none"> Ordinances </p> 
                      </div> 
                      <div className="flex flex-row items-center gap-2 my-5"> 
                        <CustomRadioButton value="The Holy Spirit" selectedValue={holySpirit} onChange={setHolySpirit} /> 
                        <p className="text-[#062950] font-medium leading-none"> The Holy Spirit </p> 
                        </div> 
                        <div className="flex flex-row items-center gap-2 my-5"> 
                          <CustomRadioButton value="Creation" selectedValue={creation} onChange={setCreation} />
                           <p className="text-[#062950] font-medium leading-none"> Creation </p> 
                           </div>
                            </div>
    </div>
  )}
</div>
                  <div className="border border-[#BBBBBB]  border-[1px]  rounded-2xl p-2.5 my-3 w-full mt-7">
  <textarea
    placeholder="Tell me your scriptural focus (optional)"
    className="w-full h-20 resize-none border-none outline-none font-regular"
  />
</div>
</div>
           </div>
            
        
         

        </div>

      </main>
     
    </div>
  )
}

export default page