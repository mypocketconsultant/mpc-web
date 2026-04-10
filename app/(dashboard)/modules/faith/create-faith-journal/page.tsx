"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft , Settings as SettingsIcon , ArrowLeft  , X , Paperclip  , ChevronRight} from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import { PlayIcon } from "@/public/icons/Play";
import { AIPrompt } from "@/public/icons/AIPrompt";
import CustomToggle from "@/app/components/CustomToggleButton"
import { NotoficationBell } from "@/public/icons/NotificationBell";
import { DownIcon } from "@/public/icons/Down";
import CustomRadioButton from "@/app/components/CustomRadioButton";

const page = () => {
    const router = useRouter();
      const [open, setOpen] = useState(false);
    const [isNotificationsOn, setIsNotificationsOn] = useState<boolean>(false);
      const [selected, setSelected] = useState<string>("");
  return ( 
     <div className="flex flex-col h-full">
      <SettingsHeader title="Faith" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
            <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/faith/faith-journal">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Faith / Faith Journal</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
           <div  className="mx-2">
            <div className="flex flex-row justify-between item-center">
                 <div className="inline-flex flex-row  cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-2 py-2 rounded-[14px] " 
                //  onClick={()=> router.push('/modules/faith/create-faith-journal')}
                 >
              <p className='text-xs sm:text-base text-white m-0'>Publish</p>
            </div>

                <div className="bg-[#F5FAFF] rounded-full">
                    <X color="#BBBBBB"/>
                </div>
              
            </div>
            <div className="flex flex-row flex-wrap w-full justify-between items-start gap-0 md:gap-0 lg:gap-4 mt-5 h-full">
              {/* Add Title */}
            <div className="w-full md:w-full lg:w-[60%] mx-auto h-screen overflow-y-auto pr-2 my-0 md:my-4
  [&::-webkit-scrollbar]:w-4
  [&::-webkit-scrollbar-track]:bg-white
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  [&::-webkit-scrollbar-thumb]:border-[4px]
  [&::-webkit-scrollbar-thumb]:border-solid
  [&::-webkit-scrollbar-thumb]:border-white
  hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
">
        <input
  type="text"
  placeholder="Add title"
  className="w-full border-b border-[#BBBBBB] outline-none font-regular mt-4 py-2"
/>
            <div className="border border-[#BBBBBB]  border-[1px]  rounded-2xl p-2.5 my-3 w-full mt-7">
  <textarea
    placeholder="Add a description"
    className="w-full h-32 resize-none border-none outline-none font-regular"
  />
</div>
        <p className="font-bold text-[#062950]">Prompt Suggestions</p>
        {/* Propmpt suggextion with AI PROMPT */}
       <div className="ml-12 flex flex-col gap-y-5">
         <div className="flex flex-row gap-4 items-center">
          <PlayIcon/>
          <p className="text-[#062950] font-regular ">What should today’s Scripture stir in me?</p>
               <div className="flex flex-row border border-[#D9F1D9] border-[1.2px] rounded-full  py-1 px-4 items-center gap-2">
          <AIPrompt/>
          <p className="text-[#838383] font-bold text-sm sm:text-base md:text-base lg:text-lg truncate">Run Ai prompt</p>
        </div>
        </div>
        
      
    
      <div className="flex flex-row gap-4 items-center">
          <PlayIcon/>
          <p className="text-[#062950] font-regular">Should I feel God’s presence today?</p>
               <div className="flex flex-row border border-[#D9F1D9] border-[1.2px] rounded-full  py-1 px-4 items-center gap-2">
          <AIPrompt/>
          <p className="text-[#838383] font-bold text-sm sm:text-base md:text-base lg:text-lg truncate">Run Ai prompt</p>
        </div>
        </div>
        </div>
        <div className="my-6"/>
        {/* Date Entry */}
        <div className="ml-12 mt-2">
          <h4 className="text-[#CFCFCF] font-medium">Date entry</h4>
          <div className="flex flex-row items-center justify-between mt-2">
            <p className="text-[#062950] font-bold">Monday, 17, October</p>
            <p className="text-[#062950] font-bold">08:00 am</p>
            <ChevronRight color="#33363F"/>
          </div>
            <hr className="my-4 sm:my-4" />
        </div>
        {/* Set Reminder */}
        <div className="flex flex-row justify-between item-center my-8 ">
          <div className="flex flex-row gap-3 ">
            <p className="text-[#062950] font-bold">Set reminder</p>
            <NotoficationBell/>
          </div>
          <CustomToggle
          enabled={isNotificationsOn} setEnabled={setIsNotificationsOn}
          />
        </div>
          <div className="flex flex-row items-center justify-between mt-2">
            <p className="text-[#3566A2] font-bold">Monday, 17, October</p>
            <p className="text-[#3566A2] font-bold">08:00 am</p>
            <ChevronRight color="#33363F"/>
          </div>
            </div>
            {/* Attachment */}
            <div className="bg-[#FFFFFF] rounded-2xl flex flex-col h-full p-8 mt-0 lg:mt-3  w-full md:w-full lg:w-[35%]">
  {/* Attach header */}
  <div className="flex flex-row gap-2">
    <Paperclip />
    <p className="font-bold text-[#000000] text-[20px]">Attach:</p>
  </div>

  {/* Spacer */}
  <div className="my-1" />

  {/* Input field */}
  <div className="border border-gray-400 rounded-1xl p-2.5 my-3 w-full" >
    <input
      placeholder="Type Scripture reference"
      className="w-full border-none outline-none font-regular"
    />
  </div>

  {/* Spacer */}
  <div className="my-1" />

  {/* Saved devotional */}
 <div className="border border-gray-400 rounded-xl p-2.5 my-3 w-full flex flex-row justify-between items-center" onClick={() => setOpen(!open)}>
  <h3 className="text-[#062950] font-regular m-0">-A saved devotional-</h3>
  <div
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <DownIcon />
        </div>
     
</div>
    {open && (
        <div className="mt-2 border border-gray-200 rounded-xl shadow-md bg-white p-4 space-y-2">
          <div className="flex flex-col gap-1"> 
  <h3 className="text-[#000000] font-bold m-0">Select a devotional</h3>
  <p className="text-[#BBBBBB] text-xs sm:text-base m-0 font-medium">
    Select a devotional
  </p>
</div>
          <div>
              <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="New Device"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    The Nature of the Prophetic - 8th June
  </p>
            </div>
            <div className="flex flex-row items-center gap-2 my-5">
  <CustomRadioButton
    value="Password changes"
    selectedValue={selected}
    onChange={setSelected}
  />
  <p className="text-[#062950] font-medium leading-none">
    The Nature of God - 9th June
  </p>
            </div>
          </div>
           <div className="mt-auto flex justify-end ">
    <div className="flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#EDE6FF]">
      <p className="text-xs sm:text-base text-[#14100B] m-0 font-bold">Done</p>
    </div>
  </div>
        </div>
      )}

  <div className="mt-auto flex justify-end ">
    <div className="flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#EDE6FF]">
      <p className="text-xs sm:text-base text-black m-0 font-medium">Save</p>
    </div>
  </div>
</div>
</div>
           </div>
      </main>
    </div>
  )
}

export default page