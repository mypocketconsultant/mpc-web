"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft ,Plus, Settings as SettingsIcon , ArrowLeft , ChevronDown , ChevronRight   } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import DailyTips from "../components/DailyTips";
import dailyTips from "@/public/DailyTip.png";
const page = () => {
  const days: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  type DayItem = {
  day: number | string;
  activities: string[];
  bgColor?: string;
};

const octoberDays: DayItem[] = [
  { day: ' Oct 1', activities: ["", ""], bgColor: "#FDEDED" },
  { day: ' Oct 2', activities: ["Bible Study" , 'Bible Study'], bgColor: "#F6F0E9" },
  { day: '  Oct 3', activities: ["Bible Study", "Bible Study"], bgColor: "#F6F0E9" },
  { day: '  Oct 4', activities: [""], bgColor: "" },
  { day: ' Oct 5', activities: ["Bible Study", "Bible Study"], bgColor: "#F6F0E9" },
  { day: '  Oct6', activities: ["Bible Study" , 'Bible Study'], bgColor: "#F6F0E9" },
  { day: '  Oct 7', activities: ["", ""], bgColor: "" },
  { day: '  Oct 8', activities: ["Testmonies" , 'Testmonies'], bgColor: "#EADAC6" },
  { day: '  Oct 9', activities: ["Bible Study", "Choir Practice"], bgColor: "" },
  { day: ' Oct 10', activities: ["Testmonies" , 'Testmonies'], bgColor: "#EADAC6" },
  { day: ' Oct 11', activities: ["Testmonies", "Testmonies"], bgColor: "#EADAC6" },
  { day: ' Oct 12', activities: [""], bgColor: "" },
  { day: ' Oct 13', activities: ["Testmonies", "Testmonies"], bgColor: "#EADAC6" },
  { day: ' Oct 14', activities: ["Testmonies" ,"Testmonies"], bgColor: "#EADAC6" },
  { day: ' Oct 15', activities: ["Child of God", "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct 16', activities: ["Child of God" , "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct 17', activities: ["", ""], bgColor: "" },
  { day: ' Oct 18', activities: ["Child of God" , "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct19', activities: ["Child of God", "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct 20', activities: ["Child of God" , "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct 21', activities: ["Child of God", "Child of God"], bgColor: "#D4B996" },
  { day: ' Oct 22', activities: ["Yea and Amen" , 'Yea and Amen'], bgColor: "#D4B996" },
  { day: ' Oct 23', activities: ["", ""], bgColor: "" },
  { day: ' Oct 24', activities: [""], bgColor: "" },
  { day: ' Oct 25', activities: ["", ""], bgColor: "" },
  { day: ' Oct 26', activities: [""], bgColor: "" },
  { day: ' Oct 27', activities: ["", ""], bgColor: "" },
  { day: ' Oct 28', activities: [""], bgColor: "" },
  { day: '  Oct 29', activities: ["", ""], bgColor: "" },
  { day: '  Oct 30', activities: [""], bgColor: "" },
  { day: '', activities: [""], bgColor: "" },
  { day: '', activities: [""], bgColor: "" },
  { day: '', activities: [""], bgColor: "" },
  { day: '', activities: [""], bgColor: "" },
  { day: '', activities: [""], bgColor: "" },
];
  const router = useRouter();
  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="Faith" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
            <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/faith">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Faith / Faith Journal</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
             <div className="flex flex-row flex-wrap gap-4 mx-3 lg:mx-0 my-6">
             <div className=" w-full md:w-[65%] ">
            <div className="flex flex-row justify-between gap-2 items-center">
              <div className="flex flex-row  justify-between gap-3">
                   <div className="border rounded-md border-[#CFCFCF] h-10 w-10 flex items-center justify-center cursor-pointer">
                    <ChevronLeft color="#CFCFCF"/>
                  </div>
              <p className="text-[#3B3E45] py-2 text-[10px] sm:text-sm md:text-base lg:text-lg m-0">
  October 21-27, 2025
</p>
              <div className="flex flex-row gap-0.5 py-2">
                <p className="text-[#3B3E45] text-[10px] sm:text-sm md:text-base lg:text-lg m-0">
  Week view
</p>
                <ChevronDown className="mt-1"/>
              </div>
              <div className="border rounded-md border-[#CFCFCF] h-10 w-10 flex items-center justify-center cursor-pointer">
  <ChevronRight color="#CFCFCF"/>
</div>
            </div>
            <div className="inline-flex flex-row  cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-2 py-2 rounded-[10px] "
             onClick={()=> router.push('/modules/faith/create-faith-journal')}>
              <Plus color="white"/>
              <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-white m-0">
  New Entry
</p>
            </div>
            </div>
        
            {/* days of the week */}
<div className="flex gap-2 mt-4">
  {days.map((day, index) => (
    <div
      key={index}
      className="bg-[#FCFCFF] border border-[#FDEDED] py-2 px-1 rounded-md
                 flex justify-center items-center 
                 w-[calc(100%/7-0.35rem)] cursor-pointer"
    >
      <p className="text-[#2A0204] font-bold text-center text-sm sm:text-xs">
        {day}
      </p>
    </div>
  ))}
</div>
{/* days in months */}
<div className="flex flex-wrap gap-2 mt-2">
  {octoberDays.map(({ day, activities, bgColor }) => (
    <div
      key={day}
      className="border border-[#FDEDED] py-1 rounded-md cursor-pointer flex flex-col min-h-[110px] 
                 w-[calc((100%-3rem)/7)] bg-[#FCFCFF]"
    >
      {/* Date */}
      <div className="px-1 pt-2">
        <p className="text-[#3B3E45] font-medium text-[12px] sm:text-sm text-center">
          {day}
        </p>
      </div>

      {/* Activities */}
      <div className="mt-auto space-y-1.5">
        {activities.map((activity, idx) => (
          <p
            key={idx}
            className="py-0 font-medium text-black w-full px-1 text-[10px]"
            style={{ backgroundColor: bgColor || "#F6F0E9" }}
          >
            {activity}
          </p>
        ))}
      </div>
    </div>
  ))}
</div>
           </div>
             {/* Daily Tips */}
        <div className="w-full md:w-[30%]">
          <DailyTips
            dailyTip={{
              title: "The Nature Of The Prophetic",
              bibleverse: " 📖 James 3:17",
              description:
                "The Father greatly desires a pure expression of the prophetic. He longs for an unblemished representation of His heart which draws people back to Himself",
            }}
            tipsIcon={dailyTips}
          />
        </div>
       
          </div>
           <div my-10/>
      </main>
    </div>
  )
}

export default page