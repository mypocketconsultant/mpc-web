"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft , Dot  , Handshake , Bookmark } from "lucide-react";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import SettingsHeader from "@/app/components/settingsHeader";
import DailyTips from "../components/DailyTips";
import dailyTips from "@/public/DailyTip.png";
import { SocialImpactProject } from "@/lib/api/social-impact/types";
import { getAllSocialImpactProjects , getSavedSocialImpactRoles } from "@/lib/api/social-impact/endpoints";
const page = () => {
   const router = useRouter();
   const [projects, setProjects] = useState<SocialImpactProject[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getAllSocialImpactProjects();
        setProjects(response.data);

      } catch (err) {
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await getSavedSocialImpactRoles();
        setRoles(response.data || response.data || []); 
      } catch (err) {
        console.error("Failed to load saved roles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (

<div className="flex flex-col h-screen bg-white">
  {/* Header */}
  <SettingsHeader title="Social Impact" />

  {/* Scrollable Content */}
  <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full pb-24">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Back Button */}
      <div className="flex items-center justify-between my-3 sm:my-6">
        <Link href="/modules/social-impact">
          <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Social Impact / Saved Resources</span>
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
              <h5><span className="mr-2">➡️</span>Volunteer application example.doc</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <h5><span className="mr-2">➡️</span>List of open spots July.pdf</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
            <div className="flex justify-between items-center w-full">
              <h5><span className="mr-2">➡️</span>Cover Letter.pdf</h5>
              <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
                see prompt history
              </p>
            </div>
          </div>
        </div>

        {/* Daily Tips */}
        <div className="w-full md:w-[30%]">
          <DailyTips
            dailyTip={{
              title: "Make a difference ",
              // bibleverse: " 📖 James 3:17",
              description:
                "You can make a difference if you plan for it.",
            }}
            tipsIcon={dailyTips}
          />
        </div>
      </div>

      {/* Saved Volunteer */}
      <div className="w-full md:w-[50%] my-6">
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37] text-[#3566A2]">
  <Bookmark  color="white" />
</div>
          <h2 className="text-[#000000] font-bold">Saved volunteer roles</h2>
          <p className="text-[#656565] text-[14px] font-bold underline underline-offset-1 cursor-pointer">
            See all...
          </p>
        </div>

        <div className="mt-2 space-y-2">
          {roles.length > 0 ? (
          roles.map((role) => (
            <div 
              key={role.id} 
              className="flex justify-between items-center w-full border-b border-gray-50 pb-2"
            >
              <h5 className="text-[#062950] font-medium">
                {role.title || "Untitled Project"}
              </h5>
              
              <Link href={`/modules/social-impact/projects/${role.id}`}>
                <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer hover:text-[#5A3FFF] transition-colors">
                  View details
                </p>
              </Link>
            </div>
          ))
        ) : (
          <h5 className="pl-2">No saved roles found.</h5>
          // <h5 className="text-gray-500 text-sm">No saved roles found.</h5>
        )}
          {/* <div className="flex justify-between items-center w-full">
            <h5>Volunteers at Rego Park</h5>
            <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
              View details
            </p>
          </div> */}
          {/* <div className="flex justify-between items-center w-full">
            <h5>Volunteers at Woodhaven Blvd</h5>
            <p className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer">
              View details
            </p>
          </div> */}
        </div>
      </div>
      {/* social impact projects */}
      <div className="w-full bg-[#FCFCFF] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
   
      <div className="flex flex-row items-center justify-between w-full ">
  {/* Left Section: Title & Link */}
  <div className="flex flex-row gap-2 items-center min-w-0">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3566A2] text-[#3566A2]">
  <Handshake color="white" />
</div>
    <h2 className="text-[#3566A2] font-bold text-sm md:text-base whitespace-nowrap">
      Your Social Impact Projects
    </h2>
    <p className="text-[#656565] text-[12px] font-bold underline underline-offset-2 cursor-pointer whitespace-nowrap shrink-0">
      See all...
    </p>
  </div>

  {/* Right Section: The Toggle Div */}
  <div className="border border-[#CFCFCF] flex flex-row items-stretch rounded-xl md:rounded-md overflow-hidden shrink-0 text-[10px] sm:text-xs md:text-sm">
  {/* Left Side (Drafts) */}
  <div className="bg-white px-2 py-1 md:px-3 md:py-1.5 flex items-center  border-r border-[#CFCFCF]">
    <Dot size={32} />
    <p className="text-[#16375F] whitespace-nowrap">
      <span className="hidden sm:inline">Your </span>Drafts
    </p>
  </div>
  
  {/* Right Side (Published) */}
  <div className="bg-[#EDE6FF] px-2 py-1 md:px-3 md:py-1.5 flex items-center">
    <p className="text-[#3566A2] font-bold whitespace-nowrap">
      Published<span className="hidden sm:inline"> projects</span>
    </p>
  </div>
</div>
</div>
        <div className="mt-5 lg:w-[50%] w-full space-y-3">
  {projects.length > 0 ? (
    projects.map((project) => (
      <div key={project.id} className="flex justify-between items-center w-full">
        {/* Dynamic Title based on your API response */}
        <h5 className="text-gray-800 font-medium">
          {project.title}
        </h5>
        
        {/* Link to details - you can wrap this in a Link or use an onClick */}
        <p 
          className="text-[#3566A2] text-sm sm:text-base font-bold underline underline-offset-4 cursor-pointer hover:text-blue-800 transition-colors"
          // onClick={() => handleViewDetails(project.id)}
        >
          View details
        </p>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-sm italic">No projects available at the moment.</p>
  )}
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
          router.push(`/modules/social-impact/chat?prompt=${encodedPrompt}`);
        }}
        onAttach={() => {}}
        context="social"
      />
    </div>
  </div>
</div>
  )
}

export default page