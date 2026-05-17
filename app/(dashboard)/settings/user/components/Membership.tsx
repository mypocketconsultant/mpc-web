"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "@/public/icons/Download";
import { apiService } from "@/lib/api/apiService";

type AccountSummaryResponse = {
  status: string;
  message: string;
  data: {
    membership: {
      planCode: string;
      billingStatus: string;
      statusLabel: string;
      upgradeCta?: {
        label: string;
        target: string;
      };
    };
  };
};

export const Membership = () => {
  const router = useRouter();
  const [membership, setMembership] = useState<{
    planCode: string;
    billingStatus: string;
    statusLabel: string;
    upgradeCta?: {
      label: string;
      target: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadMembership() {
      try {
        const response =
          await apiService.get<AccountSummaryResponse>("/v1/auth/account-summary");
        setMembership(response.data.membership);
      } catch (error) {
        setMembership(null);
      } finally {
        setLoading(false);
      }
    }

    loadMembership();
  }, []);

  const handleUpgrade = () => {
    const target = membership?.upgradeCta?.target || "/settings/pricing";
    router.push(target);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await apiService.post("/v1/auth/export-data", {});
      alert("Export request accepted.");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const statusLabel = loading ? "Loading..." : membership?.statusLabel || "Free";
  const billingStatus = loading ? "..." : membership?.billingStatus || "active";

  return (
    <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200">
      <div className="flex gap-2 items-center">
        <h4 className="font-bold text-sm sm:text-base md:text-xl text-black">
          Membership status
        </h4>
        <div className="bg-[#F8A6AA] px-1.5 py-0.5 rounded-[8px] text-[#062950]">
          {statusLabel}
        </div>
      </div>

      <p className="font-bold text-xs sm:text-sm md:text-base text-[#43A247] capitalize">
        {billingStatus}
      </p>

      <button
        onClick={handleUpgrade}
        className="inline-flex items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-4 py-2 rounded-[10px] my-4"
      >
        <p className="text-xs sm:text-base text-white m-0">
          {membership?.upgradeCta?.label || "Upgrade to Pro"}
        </p>
      </button>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex flex-row gap-3 items-center disabled:opacity-60"
      >
        <p className="font-bold text-xs sm:text-sm md:text-base text-black">
          {exporting ? "Exporting..." : "Export my data"}
        </p>
        <Download color="black" size={20} />
      </button>
    </div>
  );
};