"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Zap,
  Settings as SettingsIcon,
  User,
  Paperclip,
  Send,
} from "lucide-react";
import Image from "next/image";
import Header from "@/app/components/header";
import Greeting from "./components/Greeting";
import CareerAdvisory from "./components/CareerAdvisory";

import ExpandToolkit from "./components/ExpandToolkit";
import InputFooter from "@/app/components/InputFooter";
import QuickAction from "./components/QuickAction";
import { useUser } from "@/hooks/useUser";

export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const { user, loading } = useUser();

  // Map routes to titles
  const getTitleFromPath = (path: string) => {
    if (path.includes("/home")) return "Home";
    if (path.includes("/career")) return "Career Advisory";
    if (path.includes("/tools")) return "Tools";
    if (path.includes("/settings")) return "Settings";
    return "My Pocket Consultant";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          {/* Greeting Section */}
          <Greeting name={loading ? "User" : (user?.firstName || "User")} />

          {/* Career Advisory Section */}
          <CareerAdvisory onRunAudit={() => router.push("/career/resume-builder")} />

          <QuickAction
            items={[
              {
                title: "Recent career docs",
                image: "/tip.png",
                onClick: () => router.push("/career/saved-resources"),
              },
              {
                title: "Career planner",
                image: "/daily.png",
                onClick: () => router.push("/career/create-plan"),
              },
              {
                title: "AI career agent",
                image: "/Robot.png",
                onClick: () => router.push("/career/chat?context=career"),
              },
            ]}
          />

          {/* Expand Toolkit Section */}
          <ExpandToolkit />
       
        </div>
      </main>

      {/* Chat Input Footer */}
      <div className=" border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <InputFooter
            placeholder="Ask me to optimize your LinkedIn..."
            onSend={(message) => console.log("Sent:", message)}
            onAttach={() => console.log("Attach clicked")}
            context="career"
          />
        </div>
      </div>
    </div>
  );
}
