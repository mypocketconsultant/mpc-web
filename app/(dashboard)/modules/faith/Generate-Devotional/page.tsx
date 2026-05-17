

"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft , BookMarked, Settings , Download , Plus } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import Modal from "@/app/components/Modal";
const page = () => {
     const router = useRouter();
     const [isOpen, setIsOpen] = useState(false);
  return (

<div className="flex flex-col h-screen"> {/* h-screen ensures it fills the whole window */}
  <SettingsHeader title="Faith" />

  {/* MAIN: flex-1 allows this to grow and take up all available space. overflow-auto allows scrolling inside */}
  <main className="flex-1 overflow-auto w-full scrollbar-hide">
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8">
      
      {/* Breadcrumb Section */}
      <div className="flex items-center justify-between my-3 sm:my-6">
        <Link href="/modules/faith/Devotional-planner">
          <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-[#000000] font-normal">Faith / Generate Devotional</span>
          </button>
        </Link>
      </div>

      <hr className="my-4 sm:my-10" />

      {/* Action Icons */}
      <div className="flex flex-row justify-end gap-6 items-center">
        <BookMarked className="cursor-pointer" />
        <Download  onClick={()=> setIsOpen(true)}  className="cursor-pointer"/>
        <Settings   className="cursor-pointer" onClick={()=>router.push('../faith/Devotional-preferences')}/>
        <div className="flex flex-row items-center rounded-2xl gap-2 bg-[#EDE6FF] py-2 px-3 cursor-pointer">
          <Plus />
          <p className="text-[#062950] font-normal m-0">Add to journal</p>
        </div>
      </div>

      {/* Cards Content */}
      <div className="flex flex-col gap-y-5 mt-5">
        <div className="w-full bg-[#8B7961] p-6 rounded-2xl">
          <h4 className="font-bold text-[#FDEDED]">Scripture</h4>
          <h4 className="font-bold text-[#FDEDED]">James 3:17</h4>
          <p className="text-[#FDEDED] font-normal truncate">But the wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit, impartial and sincere.</p>
        </div>

        <div className="w-full bg-[#FCFCFF] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <h4 className="font-bold text-[#14100B]">Reflection</h4>
          <h4 className="font-bold text-[#14100B]">The Nature Of The Prophetic</h4>
          <p className="text-[#14100B] font-normal leading-relaxed">Father greatly desires a pure expression of the prophetic...</p>
        </div>

        <div className="w-full bg-[#F6F0E9] p-6 rounded-2xl mb-8"> {/* Added margin-bottom so text isn't hidden by footer */}
          <h4 className="font-bold text-[#14100B]">Guided prayer</h4>
          <p className="text-[#14100B] font-normal pt-2">The bible says to desire spiritual gifts. Pray to have the gift of prophecy.</p>
        </div>
      </div>
    </div>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="p-5">
        <h4 className="font-bold text-black">Share</h4>
        <div className="space-y-2 my-2">
          <p className="text-[#062950] font-medium">Download as PDF</p>
              <p className="text-[#062950] font-medium">Copy link</p>
        </div>
         <div className="mt-auto flex justify-end ">
    <div className="flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#EDE6FF]"
    onClick={()=> setIsOpen(false)}
    >
      <p className="text-xs sm:text-base text-[#14100B] m-0 font-bold">Done</p>
    </div>
  </div>
      </div>
      </Modal>
  </main>

  {/* FOOTER: This is now outside of <main>, making it stay at the bottom of the screen */}
  <footer className=" border-t border-gray-100 px-3 sm:px-4 md:px-6 py-4">
    <div className="max-w-full mx-auto">
      <InputFooterWithMic
        placeholder="Describe to me what you need help with"
        onSend={(message) => {
          const encodedPrompt = encodeURIComponent(message);
          router.push(`/Life/chat?prompt=${encodedPrompt}`);
        }}
        onAttach={() => {}}
        context="life"
      />
    </div>
  </footer>
</div>
  )
}

export default page