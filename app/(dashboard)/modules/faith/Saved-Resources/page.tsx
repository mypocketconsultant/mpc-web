"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft  } from "lucide-react";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import SettingsHeader from "@/app/components/settingsHeader";
import DailyTips from "../components/DailyTips";
import dailyTips from "@/public/DailyTip.png";
const page = () => {
   const router = useRouter();
  return (

<div className="flex flex-col h-screen bg-white">
  {/* Header */}
  <SettingsHeader title="Faith" />

  {/* Scrollable Content */}
  <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full pb-24">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Back Button */}
      <div className="flex items-center justify-between my-3 sm:my-6">
        <Link href="/modules/faith">
          <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Faith / Saved Resources</span>
          </button>
        </Link>
      </div>

      <hr className="my-4 sm:my-10" />

      {/* Recent Documents */}
      <div className="flex flex-row flex-wrap w-full justify-between items-start gap-4">
        <div className="w-full md:w-[55%]">
          <div className="flex flex-row items-center gap-2">
            <h2 className="text-[#000000] font-bold">Recent documents</h2>
            <p className="text-[#656565] text-[14px] font-bold underline underline-offset-1 cursor-pointer">
              See all...
            </p>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center w-full">
              <h5><span className="mr-2">➡️</span>My book of conviction.pdf</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <h5><span className="mr-2">➡️</span>November journal history.xls</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <h5><span className="mr-2">➡️</span>Book of bible stories.doc</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
          </div>
        </div>

        {/* Daily Tips */}
        <div className="w-full md:w-[35%]">
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

      {/* Saved Devotionals */}
      <div className="w-full md:w-[50%] my-6">
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-[#000000] font-bold">Saved Devotionals</h2>
          <p className="text-[#656565] text-[14px] font-bold underline underline-offset-1 cursor-pointer">
            See all...
          </p>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center w-full">
            <h5>The Nature of the prophetic</h5>
            <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
              View Devotional
            </p>
          </div>
          <div className="flex justify-between items-center w-full">
            <h5>The nature of God</h5>
            <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
              View Devotional
            </p>
          </div>
          <div className="flex justify-between items-center w-full">
            <h5>The Life of Christ</h5>
            <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
              View Devotional
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>

  {/* Input Footer pinned at bottom */}
  <div className=" bg-white px-3 sm:px-4 md:px-6 py-0">
    <div className="max-w-7xl mx-auto">
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
  </div>
</div>
  )
}

export default page