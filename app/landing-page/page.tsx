"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from 'react'
import SectionCard from "./components/SectionCard";
import HeroCard from "./components/HeroCard";
import careerIcon from "@/public/landing-page/hero/career.png";
import StudyIcon from "@/public/StudySupport.png";
import FinanceIcon from "@/public/Finance.png";
import LifeIcon from "@/public/Life.png";
import BusinessIcon from "@/public/Business.jpg";
import SocialIcon from "@/public/Social.png";
import FaithIcon from "@/public/faith.png";
const page = () => {
  const router = useRouter();
  const aiFeatures = [
    "A unified conversational interface for real-time advisory",
    "Generate documents: resumes, study plans, reports, business plans, etc.",
    "Connects insights across all modules to provide deep personalization",
    "Memory-driven context that evolves with the user"
  ];
  const LifeFeatures = [
    "Personalized clarity prompts and life audits",
    "Emotional insight tracking (patterns, triggers, growth points)",
    "Structured goal-setting with achievable milestones",
  ];
  const StudyFeatures = [
    "Personalized study plans based on subjects, pace, and capacity",
    "AI-generated revision timetables and learning pathways",
    "Guidance on exams, projects, and academic workflow optimization",
  ];
  const CareerFeatures = [
    "AI-powered resume builder and portfolio enhancer",
    "Career path exploration with skill-gap analysis",
    "Performance review preparation and promotion planning",
  ];
  const BusinessFeatures = [
    "Business model validation and refinement tools",
    "Financial planning, projections, and cost optimization suggestions",
    "SOP, workflow, and organizational structuring recommendations",
  ];
    const SocialFeatures = [
    "Project planning templates for NGOs, community leaders, and volunteers",
    "SDG-aligned goal mapping and measurement frameworks",
    "Advisory on fundraising, partnerships,and stakeholder engagement",
  ];
  const FinanceFeatures = [
    "Expense tracking with smart categorization and insights",
    "Personalized budgets based on lifestyle and income",
    "Tips for financial discipline and wealth-building habits",
  ];
  const FaithFeatures = [
    "Daily devotionals and contextual scripture explanations",
    "Faith habit trackers (prayer, study,fellowship, service)",
    "A gentle, supportive spiritual companion for growth",
  ];
  const heroData = [
  {
    image: careerIcon,
    title: "Career Advisory",
    description: "Navigate your career with precision.",
  },
  {
    image: LifeIcon,
    title: "Life Advisory",
    description: "Gain clarity, direction, and confidence in your personal journey.",
  },
  {
    image: StudyIcon,
    title: "Study Advisory",
    description: "Build smarter and study with purpose.",
  },
  {
    image:  BusinessIcon,
    title: "Business Consultancy",
    description: "Turn ideas into thriving businesses.",
  },
   {
    image: SocialIcon,
    title: "Social Impact Advisory",
    description: "Amplify your contribution to society.",
  },
  {
    image: FinanceIcon,
    title: "Finance Advisory",
    description: "Manage your money with confidence.",
  },
  {
    image: FaithIcon,
    title: "Faith Module (Christian)",
    description: "Grow spiritually with scripture reflections, and faith-building habits",
  },
  
];
  
  return (
    <div className='w-full '>
      <main className=" px-6 py-4">
    <nav className='w-full  flex items-center justify-between'>
<Image
  src="/logo.png"
  alt="Logo"
  className="w-32 h-auto sm:w-40 md:w-48 lg:w-56"
  width={167}
  height={30}
/>
                  <div className="flex flex-row gap-2 items-center ">
                   <p className="text-[#16375F] font-medium text-lg sm:text-xl md:text-1xl lg:text-1xl text-center hidden md:block">
  Pricing
</p>
                       <div className="inline-flex flex-row  cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-2 py-2 rounded-[10px] "
             
             >
              <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-[#FFE5DF] m-0 font-bold">
 Get Started
</p>
            </div>
                  </div>
    </nav>
    <div className="my-20"/>
   <div className="my-5">
  <div className="text-center">
  <h4 className="font-bold text-[#062950] text-lg sm:text-xl lg:text-2xl leading-tight">
    “Finding Clarity, Building Purpose 
    <br className="block sm:hidden" />
     and Living Brighter with{" "}
    
    <span className="inline-flex items-center gap-1">
      <Image
        src="/logo.png"
        alt="Logo"
        width={99}
        height={18}
        className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto"
      />"
    </span>
  </h4>
</div>

<h4 className="text-[#16375F] font-medium text-center text-sm sm:text-base md:text-xl leading-relaxed py-2 px-4 max-w-[90%] mx-auto">
  Experience AI-powered advisory across life, career, finance, study, and
  <br className="hidden md:block" />
  even your spiritual walk. One platform for whole-life transformation.
</h4>
   </div>
  
<div className="flex justify-center w-full">
  <div 
    className="inline-flex  my-1 flex-row cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-4 py-2 rounded-[10px]"
    
  >
    <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-[#FFE5DF] m-0 font-bold">
      Get Started
    </p>
  </div>
</div>
 <div className="mt-20"/>
<div className="flex flex-wrap gap-6 justify-center items-center my-6">
  {heroData.map((item) => (
    <HeroCard
      key={item.title}
      image={item.image}
      title={item.title}
      description={item.description}
    />
  ))}
</div>
<div className="flex flex-col space-y-4">
  <SectionCard 
        backgroundGradient="linear-gradient(180deg, #FDECFF 0%, #FEF6FF 50%, rgba(254, 246, 255, 0.2) 100%)"
        borderColor="#FBD5FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="AI Agent Workspace"
        title={<>The intelligent command center <br/> powering the whole experience.</>}
        features={aiFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/Ai.png"
      />
       <SectionCard 
        backgroundGradient="linear-gradient(180deg, #FDECFF 0%, #FEF6FF 50%, rgba(254,246,255,0.2) 100%)"
        borderColor="#FBD5FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Life Advisory"
        title={<>Helps users gain clarity,<br/> direction, and personal <br/> alignment.</>}
        features={StudyFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/life.png"
      />
        <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Study Advisory"
        title={<>Helps users gain clarity,<br/> direction, and personal <br/> alignment.</>}
        features={StudyFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/study.png"
        imagePosition="left"
      />
        <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Career Advisory"
        title={<>A full suite for job seekers,<br/> professionals, and career <br/> transitions.</>}
        features={CareerFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/career.png"
        imagePosition="left"
      />
        <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Business Consultancy"
        title={<>Supports founders, creatives,<br/> and SME owners with  <br/> operational clarity.</>}
        features={BusinessFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/business.png"
        imagePosition="left"
      />
       <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Social Impact Advisory"
        title={<>Empowers individuals and  <br/>organizations to create <br/> meaningful change.</>}
        features={SocialFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/social.png"
        imagePosition="right"
      />
       <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Finance Advisory"
        title={<>Gives users the tools to build <br/> better financial habits and  <br/>stability.</>}
        features={FinanceFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/finance.png"
        imagePosition="right"
      /> 
        <SectionCard 
        backgroundGradient="linear-gradient(180deg, #E7E5FF 0%, #E7E5FF 50%,rgba(231,229,255,0.2) 100%)"
        borderColor="#DCD9FF"
        tagIcon="/landing-page/landingtag.png"
        tagText="Faith Module (Christian)"
        title={<>An optional spiritual-growth <br/> space built on biblical principles.</>}
        features={FaithFeatures}
        buttonText="Start Humanizing"
        imageSrc="/landing-page/faith.png"
        imagePosition="right"
      /> 
</div>
{/* pricing */}
<div className="flex flex-col items-center justify-center  mt-10">
   <h4 className="text-[#062950] font-bold">Start for free. Upgrade to get the capacity that exactly matches your needs.</h4>
<div className="flex flex-wrap justify-center gap-3 mt-5">
  <Image
    src="/landing-page/frame1.png"
    alt="Logo"
    width={167}
    height={30}
    className="w-28 sm:w-32 md:w-40 lg:w-48 h-auto"
  />
  <Image
    src="/landing-page/frame2.png"
    alt="Logo"
    width={167}
    height={30}
    className="w-28 sm:w-32 md:w-40 lg:w-48 h-auto"
  />
  <Image
    src="/landing-page/frame3.png"
    alt="Logo"
    width={167}
    height={30}
    className="w-28 sm:w-32 md:w-40 lg:w-48 h-auto"
  />
</div>
</div>
<div className="my-20"/>
{/* footer */}
<div className="flex flex-col items-center justify-center text-center">
  <h4 className="text-[#062950] font-bold">Ready to Live Purposefully?</h4>
  
  <div className="inline-flex my-4 flex-row cursor-pointer gap-2 items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-4 py-2 rounded-[10px]">
    <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-[#FFE5DF] m-0 font-bold">
      Get Started
    </p>
  </div>
</div>
</main>
    </div>
  )
}

export default page