"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft  } from "lucide-react";
import Image from "next/image";
import Header from "@/app/components/header";
import SettingsHeader from "@/app/components/settingsHeader";
import { Membership } from "./components/Membership";
import UserProfile from "./components/UserProfile";
const page = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="User" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/home">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Go back Home</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
          <div className="my-4 sm:my-10  flex-col flex sm:flex-row w-full gap-6">
  <div className="flex-[0_0_70%]">
    <UserProfile />
  </div>
  <div className="flex-[0_0_30%]">
    <Membership />
  </div>
</div>
        </div>

      </main>
    </div>
  )
}

export default page