"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import { DownIcon } from "@/public/icons/Down";
import CustomRadioButton from "@/app/components/CustomRadioButton";

const DEVOTIONAL_OPTIONS = [
  "The Trinity",
  "Deity and Humanity of Christ",
  "Salvation by Grace",
  "The Authority of Scripture",
  "The Resurrection and Return of Christ",
  "Humanity's Need",
  "The Church",
  "Ordinances",
  "The Holy Spirit",
  "Creation",
];

const Page = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const handleSelect = (option: string) => {
    setSelected(option);
    setOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader title="Faith" />

      <main className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto scrollbar-hide">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
          <div className="my-3 flex items-center justify-between sm:my-6">
            <Link href="/modules/faith/Devotional-planner">
              <button
                type="button"
                className="flex items-center gap-2 text-xs text-gray-700 transition-colors hover:text-[#5A3FFF] sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-regular text-[#000000]">
                  Faith / Generate Devotional
                </span>
              </button>
            </Link>
          </div>

          <hr className="my-4 sm:my-10" />

          <div className="mx-auto w-full sm:max-w-[350px] lg:max-w-[700px]">
            <div className="my-4 flex w-[80px] cursor-pointer items-center justify-center rounded-[10px] bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-4 py-2 transition-all hover:opacity-90 active:scale-95">
              <p className="m-0 text-xs font-medium text-white sm:text-base">
                Go!
              </p>
            </div>

            <h5 className="font-medium text-[#062950]">
              Set devotional preferences
            </h5>

            <div className="mt-2" />

            <div className="flex flex-col items-end">
              <div className="relative w-full">
                <button
                  type="button"
                  className="my-3 flex w-full cursor-pointer flex-row items-center justify-between rounded-xl border border-gray-400 p-2.5 text-left"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <h3 className="font-regular m-0 text-[#062950]">
                    {selected || "-Select devotional theme-"}
                  </h3>
                  <DownIcon />
                </button>

                {open && (
                  <div className="absolute right-0 top-0 z-50 mt-14 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:w-[25rem]">
                    <h3 className="m-0 font-bold text-[#000000]">
                      Select a devotional preference
                    </h3>

                    <div className="max-h-60 overflow-y-auto pr-2">
                      {DEVOTIONAL_OPTIONS.filter(Boolean).map(
                        (option, index) => (
                          <button
                            type="button"
                            key={`${option}-${index}`}
                            className="my-5 flex w-full cursor-pointer flex-row items-center gap-2 text-left"
                            onClick={() => handleSelect(option)}
                          >
                            <CustomRadioButton
                              checked={selected === option}
                              onChange={() => handleSelect(option)}
                            />

                            <span className="font-medium leading-none text-[#062950]">
                              {option}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="my-3 mt-7 w-full rounded-2xl border border-[#BBBBBB] p-2.5">
                <textarea
                  placeholder="Tell me your scriptural focus (optional)"
                  className="font-regular h-20 w-full resize-none border-none outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;