"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import SettingsHeader from "@/app/components/settingsHeader";
import SortIcon from "@/public/icons/Sort";
import VolunteerList from "../components/VolunteerList";

export default function Page() {
  const handleVisible = () => {
    // Placeholder callback required by VolunteerList.
    // Add actual behavior here if VolunteerList expects to trigger something.
  };

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader title="Social Impact" />

      <main className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto scrollbar-hide">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
          {/* Header / Breadcrumb */}
          <div className="my-3 flex flex-row items-center justify-between sm:my-6">
            <Link href="/modules/social-impact/volunteer-project-finder">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 transition-colors hover:text-[#5A3FFF] sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Social Impact / Volunteer Project Finder</span>
              </button>
            </Link>
          </div>

          <hr className="my-4 sm:my-10" />

          {/* Toolbar */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <SortIcon />
              <p className="font-medium text-[#000000]">Sort by</p>
            </div>

            <div className="flex shrink-0 flex-row items-stretch overflow-hidden rounded-xl border border-[#CFCFCF] text-[10px] sm:text-xs md:rounded-md md:text-sm">
              <div className="flex items-center bg-[#EDE6FF] px-2 py-1 md:px-3 md:py-1.5">
                <p className="whitespace-nowrap font-bold text-[#3566A2]">
                  List <span className="hidden sm:inline">view</span>
                </p>
              </div>

              <div className="flex items-center border-r border-[#CFCFCF] bg-white px-2 py-1 md:px-3 md:py-1.5">
                <p className="whitespace-nowrap text-[#16375F]">Map</p>
              </div>
            </div>
          </div>

          {/* Volunteer List */}
          <div className="mt-2">
            <VolunteerList visible={handleVisible} />
          </div>
        </div>
      </main>
    </div>
  );
}