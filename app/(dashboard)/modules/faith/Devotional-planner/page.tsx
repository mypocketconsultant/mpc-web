"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft ,Plus, Settings as SettingsIcon , ArrowLeft, ChevronRight  , ChevronDown , X } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import DailyTips from "../components/DailyTips";
import dailyTips from "@/public/DailyTip.png";
import WeeklyDevotional from "../components/WeeklyDevotional";
import Modal from "@/app/components/Modal";
import { NotoficationBell } from "@/public/icons/NotificationBell";
const page = () => {
  const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

 
  const handleEdit = (dayIndex: number, itemIndex: number, item: any) => {
    setSelectedItem(item); 
    setModalOpen(true);     
  };
  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="Faith" />
      <main
      className="
  flex-1
  overflow-auto
  max-w-[1200px]
  w-full
  mx-auto           /* default large screen */
  md:mx-4 md:my-2   /* applies below 768px (md breakpoint) */
  lg:mx-auto lg:my-0 /* reset for large screens > 1024px */
  scrollbar-hide
"
      >
            <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/faith">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Faith / Devotional Planner</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
          <div className="flex flex-row flex-wrap gap-4">
             <div className=" w-full md:w-[65%] ">
            <div className="flex flex-row justify-between gap-2 items-center">
              <div className="flex flex-row  justify-between gap-3">
                   <div className="border rounded-md border-[#CFCFCF] h-10 w-10 flex items-center justify-center cursor-pointer">
  <ChevronLeft color="#CFCFCF"/>
</div>
              <p className="text-[#3B3E45] py-2">October 21-27, 2025</p>
              <div className="flex flex-row gap-0.5 py-2">
                <p className="text-[#3B3E45]">Week view</p>
                <ChevronDown/>
              </div>
              <div className="border rounded-md border-[#CFCFCF] h-10 w-10 flex items-center justify-center cursor-pointer">
  <ChevronRight color="#CFCFCF"/>
</div>
            </div>
            <div className="inline-flex flex-row  cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-2 py-2 rounded-[10px] "
             onClick={()=> router.push('/modules/faith/Generate-Devotional')}>
              <Plus color="white"/>
              <p className='text-xs sm:text-base text-white m-0'>New Entry</p>
            </div>
            </div>
   <div 
     className="
    my-8
    w-full
    mx-auto
    max-h-[400px]
    overflow-y-auto      /* vertical scroll always */
    overflow-x-auto sm:overflow-x-hidden  /* horizontal scroll only on small screens */
    pr-2
    /* Scrollbar styling */
    [&::-webkit-scrollbar]:w-4
    [&::-webkit-scrollbar-track]:bg-white
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    [&::-webkit-scrollbar-thumb]:border-[4px]
    [&::-webkit-scrollbar-thumb]:border-solid
    [&::-webkit-scrollbar-thumb]:border-white
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
  "
  >
            <WeeklyDevotional
            onEdit={handleEdit}
  days={[
    {
      month: 'Oct',
      date: 21,
      monthBgColor: '#FFE4B5', 
      items: [
        { title: 'Jesus child', time: '10:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
         { title: 'Testimonies', time: '10:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
      ],
    },
    {
      month: 'Oct',
      date: 22,
      monthBgColor: '#EADAC6',
      items: [
        { title: 'Testimonies', time: '10:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
        
      ],
    },
    {
      month: 'Oct',
      date: 23,
      monthBgColor: '#D4B996',
      items: [
        { title: 'Faith and hope', time: '10:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
      ],
    },
    {
      month: 'Oct',
      date: 24,
      monthBgColor: '#FFFFFF',
      items: [
        { title: '', time: '', description: '' },
      ],
    },
    {
      month: 'Oct',
      date: 25,
      monthBgColor: '#C1A888',
      items: [
        { title: 'Child of God', time: '12:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
        { title: 'Learn at his feet', time: '9:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
      ],
    },
    {
      month: 'Oct',
      date: 26,
      monthBgColor: '#FFFFFF',
      items: [
        { title: '', time: '', description: '' },
      ],
    },
    {
      month: 'Oct',
      date: 27,
      monthBgColor: '#A79276',
      items: [
          { title: 'Bible Study', time: '12:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
        { title: 'Create study no....', time: '09:00', description: 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing' },
      ],
    },
  ]}
/>
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
      </main>
       <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
  {selectedItem && (
    <div className="p-6 w-full  bg-[#F6F0E9]  rounded-2xl">
        <div className="mt-auto flex justify-end ">
        <div
        className="  cursor-pointer"
        onClick={() => setModalOpen(false)}
      >
        <X color="#000000" />
      </div>
      </div>
      <div className="my-5"/>
      <div className="bg-[#EADAC6] p-4 rounded-2xl">
        <div className="mt-auto flex justify-end ">
    <div className="flex items-center justify-center px-4 py-2 w-[50px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#EDE6FF]">
      <p className="text-xs sm:text-base text-[#062950] m-0 font-medium">Edit</p>
    </div>
  </div>
  <h3 className="text-[#14100B] font-bold text-lg">Title of planned devotional entry</h3>
  <p className="text-[#14100B] font-medium text-sm">Love for God is where it will start for me</p>
    <div className="my-4 space-y-2">
      <p className="text-[#6D5F4B] font-bold"> Time stamp</p>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <p className="text-[#4F4436] font-bold"> Created:</p>
          <p className="text-[#14100B] font-bold">Monday, 17, October</p>
        </div>
        <p className="text-[#14100B] font-bold">08:00 am</p>
      </div>
       <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <p className="text-[#4F4436] font-bold">Edited:</p>
          <p className="text-[#14100B] font-bold">Monday, 20, October</p>
        </div>
        <p className="text-[#14100B] font-bold">05:00 am</p>
      </div>
      <hr className="my-3 bg-[#8D8D8D]"/>
        <div className="flex flex-row gap-3  mt-2">
                  <p className="text-[#6D5F4B] font-bold">Reminder set</p>
                  <NotoficationBell color="#8B7961"/>
                </div>
                <h6 className="text-[#4F4436] font-bold pt-2">Monday, 17, October <span className="pl-2">08:00 am</span></h6>
    </div>
      </div>
      
    </div>
  )}
</Modal>
    </div>
  )
}

export default page