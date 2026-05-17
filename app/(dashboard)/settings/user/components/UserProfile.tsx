"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HelpIndicator } from "@/public/icons/HelpIndicator";
import Image from "next/image";
import FinanceImage from "../../../../../public/Finance.png";
import LifeImage from "../../../../../public/Life.png";
import UserImage from "../../../../../public/tip.png";
import BusinessConsultancy from "../../../../../public/consultancy.png";
import StudySupport from "../../../../../public/StudySupport.png";
import { Pencil } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

type FocusModule = {
  module: string;
  status: string;
};

type AccountSummaryResponse = {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
      email: string;
      country: string;
      preferredModule: string;
      preferredCurrency?: string;
      currentResumeId?: string | null;
      bio?: string;
    };
    focusModules: FocusModule[];
  };
};

const moduleVisuals: Record<
  string,
  { image: any; imgWidth: number; imgHeight: number; title: string }
> = {
  finance: {
    image: FinanceImage,
    imgWidth: 160,
    imgHeight: 80,
    title: "Finance",
  },
  "life-advisory": {
    image: LifeImage,
    imgWidth: 100,
    imgHeight: 80,
    title: "Life Advisory",
  },
  life: {
    image: LifeImage,
    imgWidth: 100,
    imgHeight: 80,
    title: "Life Advisory",
  },
  "business-consultancy": {
    image: BusinessConsultancy,
    imgWidth: 50,
    imgHeight: 80,
    title: "Business Consultancy",
  },
  business: {
    image: BusinessConsultancy,
    imgWidth: 50,
    imgHeight: 80,
    title: "Business Consultancy",
  },
  study: {
    image: StudySupport,
    imgWidth: 100,
    imgHeight: 80,
    title: "Study Support",
  },
  "study-support": {
    image: StudySupport,
    imgWidth: 100,
    imgHeight: 80,
    title: "Study Support",
  },
};

const statusColors: Record<string, string> = {
  active: "#93CF92",
  exploring: "#FFED90",
  inactive: "#CFCFCF",
  paused: "#F67B81",
};

const UserProfile = () => {
  const [summary, setSummary] = useState<AccountSummaryResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        const response =
          await apiService.get<AccountSummaryResponse>("/v1/auth/account-summary");
        setSummary(response.data);
        setFirstName(response.data.user.firstName || "");
        setLastName(response.data.user.lastName || "");
      } catch (error) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  const handleSaveName = async () => {
    try {
      await apiService.patch("/v1/auth/me", {
        firstName,
        lastName,
      });

      setSummary((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`.trim(),
              },
            }
          : prev,
      );
      setEditingName(false);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update profile.");
    }
  };

  const cards = useMemo(() => {
    if (!summary?.focusModules?.length) {
      const fallbackModule = summary?.user?.preferredModule
        ? [{ module: summary.user.preferredModule, status: "active" }]
        : [];

      return fallbackModule;
    }

    return summary.focusModules;
  }, [summary]);

  return (
    <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200">
      <div className="flex flex-row gap-3 items-center">
        <Image src={UserImage} alt="User Image" width={56} height={56} className="rounded-xl" />

        <div className="flex flex-col gap-2">
          {!editingName ? (
            <div className="flex flex-row gap-2 items-center">
              <h2 className="font-bold text-sm sm:text-base md:text-xl text-black">
                {loading ? "Loading..." : summary?.user?.fullName || "User"}
              </h2>

              <button
                className="flex flex-row gap-2 items-center"
                onClick={() => setEditingName(true)}
              >
                <div className="my-1">
                  <Pencil size={15} />
                </div>
                <p className="font-black text-sm">Edit</p>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="border rounded-lg px-3 py-2"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="border rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  className="px-3 py-2 rounded-lg bg-[#5A3FFF] text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-2 rounded-lg bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-black text-sm py-2">
        {loading
          ? "Loading profile..."
          : summary?.user?.bio || "Building your personalized MPC experience."}
      </p>

      <hr className="my-4 sm:my-2" />

      <h2 className="text-[#3566A2] font-bold text-[20px]">Focus Modules</h2>

      <div className="flex flex-row gap-1 items-center py-1">
        <HelpIndicator size={18} />
        <h5 className="text-[#977400] text-sm sm:text-base">
          Your experience adapts based on what you’re focusing on.
        </h5>
      </div>

      <div className="flex flex-row my-3">
        <div className="flex flex-row flex-wrap gap-4">
          {cards.map((card, index) => {
            const normalized = card.module.toLowerCase();
            const visual =
              moduleVisuals[normalized] ||
              moduleVisuals[normalized.replace(/\s+/g, "-")] || {
                image: StudySupport,
                imgWidth: 100,
                imgHeight: 80,
                title: card.module,
              };

            const badgeColor = statusColors[card.status?.toLowerCase()] || "#CFCFCF";

            return (
              <div
                key={`${card.module}-${index}`}
                className="bg-[#EDE6FF] px-3 py-1 rounded-xl flex justify-between items-center gap-4 flex-auto w-full min-w-full max-w-none md:min-w-[200px] md:max-w-[240px]"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-[#062950] font-bold text-[13px]">{visual.title}</p>
                  <div
                    className="inline-flex justify-center items-center rounded-full px-4 py-1 self-start"
                    style={{ backgroundColor: badgeColor }}
                  >
                    <p className="text-[#062950] text-[12px] font-medium m-0 whitespace-nowrap capitalize">
                      {card.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Image
                    src={visual.image}
                    alt={`${visual.title} Image`}
                    style={{
                      width: visual.imgWidth,
                      height: visual.imgHeight,
                    }}
                    className="rounded-xl block object-contain"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;