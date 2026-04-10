"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft , ArrowRight  } from "lucide-react";
import CheckIcon from "@/public/icons/Check";
import { Pencil  , X , ChevronDown} from 'lucide-react';
import SettingsHeader from "@/app/components/settingsHeader";
import Modal from "@/app/components/Modal";
import { HelpIndicator } from '@/public/icons/HelpIndicator'
const page = () => {
  const router = useRouter();
   const [isOpen, setIsOpen] = useState(false);
   const [isOpenP, setIsOpenP] = useState(false);
   const [isOpenD, setIsOpenD] = useState(false);
   type DropdownType = "appearance" | "style" | "headers" | "emoji";

const [openDropdown, setOpenDropdown] = useState<DropdownType | null>(null);
function handleOpen(
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  open: () => void
): void {
  if (!isOpen) {
    open(); // call your existing open logic
  }
  setIsOpen(!isOpen);
}

const toggleDropdown = (section: DropdownType) => {
  setOpenDropdown(openDropdown === section ? null : section);
};
  return (
      <div className="flex flex-col h-full">
      <SettingsHeader title="Settings" />
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
            
          <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
            <div>
              
            </div>
            <div>
               <div className="flex flex-row gap-6 ml-3">
                 <div className="flex flex-row gap-2">
              <CheckIcon/>
              <p className="font-medium text-[#3566A2] text-xs sm:text-sm md:text-base lg:text-lg">
  Password: strong
</p>
            </div>
             <div className="flex flex-row gap-2">
              <CheckIcon/>
              <p className="font-medium text-[#3566A2] text-xs sm:text-sm md:text-base lg:text-lg">
               Multi-factor authentication: Enabled
              </p>
            </div>
               </div>
               <div className="border border-gray-500 rounded-md p-4 flex flex-row gap-2 my-4">
                <input 
                  placeholder="John_doe@johnmail.com"
                  className="w-full border-none outline-none"
                />
                  <div className='flex flex-row gap-2 item-center'>
                                <div className='my-1'>
                                    <Pencil size={15}/>
                                </div>
                                <p className='font-black text-sm'>Edit</p>
                            </div>
               </div>
                <hr className="my-4 sm:my-10" />
                <div>
                  <h2 className="text-[#838383] font-medium">Security</h2>
                  <div className="flex flex-row gap-2 my-4 pl-5  cursor-pointer" onClick={()=> router.push('security/change-password')}>
                    <h5 className="text-[#062950] font-bold"> Change password</h5>
                    <ArrowRight color="black"/>
                  </div>
                  <div className="flex flex-row gap-2 my-4 pl-5  cursor-pointer"  onClick={()=> router.push('security/Enable-MFA')}>
                    <h5 className="text-[#062950] font-bold"> Enable Multi-factor authentication</h5>
                    <ArrowRight color="black"/>
                  </div>
                  <div className="flex flex-row gap-2 my-4 pl-5">
                    <h5 className="text-[#062950] font-bold">Trusted devices</h5>
                    <ArrowRight color="black"/>
                  </div>
                  <p className="font-regular  text-[#595959] pl-5">Omoniyi Macbook OS Tahoe (This device) - <span className="text-[#595959] font-bold"> Last signed-in March 20, 2026</span></p>
                  
                  <div className="flex flex-col gap-4 my-4 pl-5">
                  <div className=" items-center justify-center px-4 py-2 w-[200px] rounded-[10px] bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]">
                    <p className="text-xs sm:text-base text-white m-0">
                      Log out of this device
                    </p>
                  </div>

                  <div className=" items-center justify-center px-4 py-2 w-[200px] rounded-[10px] bg-[#EDE6FF]">
                    <p className="text-xs sm:text-base text-[#16375F] m-0">
                      Log out of all devices
                    </p>
                  </div>
                </div>
                  <div className="flex flex-row gap-2 my-4  cursor-pointer "  onClick={()=> router.push('security/notification-alerts')}>
                    <h5 className="text-[#062950] font-bold">Set up Notification</h5>
                    <ArrowRight color="black"/>
                  </div>
                  <div className="flex flex-row gap-2 my-4 ">
                    <h5 className="text-[#062950] font-bold"
                  
                    > Personalization</h5>
                    <ArrowRight color="black"   onClick={()=> setIsOpenP(true)} className="cursor-pointer"/>
                  </div>
                  <div className=" flex flex-col gap-y-4">
                    <h2 className="text-[#838383] font-medium">Privacy policy</h2>
                    <h2 className="text-[#838383] font-medium  cursor-pointer"  onClick={()=> router.push('security/terms-of-service')}>Terms of service</h2>
                      <h2 className="text-[#838383] font-medium">Compliance statements</h2>
                    <h2 className="text-[#838383] font-medium cursor-pointer"
                    onClick={()=> setIsOpen(true)}
                    >Account deletion</h2>
                    
                  </div>
                </div>
            </div>
           </div>
         

        </div>

      </main>
       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="py-8 px-12">
       <div
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-[#E8E8E8] rounded-full p-2"
            onClick={() => setIsOpen(false)}
          >
            <X  color="#000000"/>
          </div>
         
        <div className="mt-10">
        <div className="flex justify-center items-center w-full h-full">
  <div className="bg-[#F67B81] rounded-full p-2 w-fit">
    <X color="white" />
  </div>
</div>
          <div className="my-6"/>
         <h6 className="font-bold text-black text-center">Are you sure you want to delete your account</h6>
<div className="flex flex-row  justify-center gap-5 items-center w-full h-full mt-2">
  <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
    onClick={() => setIsOpen(true)}
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">No</p>
  </button>
    <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#EDE6FF]"
    onClick={() => setIsOpenD(true)}
  >
    <p className="text-xs sm:text-base text-[#062950] m-0 font-medium">Yes</p>
  </button>
</div>
        </div>
       </div>
      </Modal>
        <Modal isOpen={isOpenP} onClose={() => setIsOpenP(false)}>
          <div className="py-8 ">
         <div className="flex  flex-row justify-between items-center w-full px-8 ">
          <h6 className="font-bold text-black">Personaliztion</h6>
  <div className="bg-[#E8E8E8] rounded-full p-1 w-fit cursor-pointer" onClick={()=> setIsOpenP(false)}>
    <X color="black" />
  </div>
        </div>
           <hr className="bg-[#BBBBBB] my-4"/>
        <div className="my-5 px-8 ">
        <div className="flex flex-row justify-between items-center py-1">
  <p className="font-medium text-[#062950]">Appearance</p>

  <div className="relative flex flex-row items-center gap-2">
    <p className="font-medium text-[#062950]">Default</p>

    <ChevronDown
       className={`cursor-pointer transition-transform ${
                openDropdown === "appearance" ? "rotate-180" : ""
              }`}
      onClick={() => toggleDropdown("appearance")}
    />

    {openDropdown === "appearance" && (
      <div className="absolute right-0 space-y-3 top-8 z-10 bg-[#FFFFFF] shadow-[var(--sds-size-depth-0)_var(--sds-size-depth-100)_var(--sds-size-depth-100)_var(--sds-size-depth-negative-100)_var(--sds-color-black-100),_var(--sds-size-depth-0)_var(--sds-size-depth-400)_var(--sds-size-depth-800)_var(--sds-size-depth-negative-100)_var(--sds-color-black-200)] rounded-md p-2 shadow-md w-32">
        <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer text-[#232323]">System</p>
        <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer text-[#232323]">Dark mode</p>
        <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer text-[#232323]">Light mode</p>
      </div>
    )}
  </div>
</div>
   <div className="flex flex-row justify-between items-center py-1 ">
  <p className="font-medium text-[#062950]">Style and tone</p>

  <div className="relative flex flex-row items-center gap-2">
    <p className="font-medium text-[#062950]">Default</p>

    <ChevronDown
       className={`cursor-pointer transition-transform ${
                openDropdown === "style" ? "rotate-180" : ""
              }`}
      onClick={() => toggleDropdown("style")}
    />

    {openDropdown === "style" && (
      <div className="absolute right-0  space-y-3 top-8 z-10 bg-[#FFFFFF] shadow-[var(--sds-size-depth-0)_var(--sds-size-depth-100)_var(--sds-size-depth-100)_var(--sds-size-depth-negative-100)_var(--sds-color-black-100),_var(--sds-size-depth-0)_var(--sds-size-depth-400)_var(--sds-size-depth-800)_var(--sds-size-depth-negative-100)_var(--sds-color-black-200)] rounded-md p-2 shadow-md w-32">
         <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Default</p>
         <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Professional</p>
        <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Friendly</p>
         <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Candid</p>
          <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Quirky</p>
           <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Efficient</p>
           <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Nerdy</p>
      </div>
    )}
  </div>
</div>
       
          <div className="my-2">
            <h4 className="text-[#062950] font-medium leading-[12px]">Additional customization</h4>
            <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1">
  Use lists and clear formatting
</p>
          </div>
                          <div className="flex flex-row justify-between items-center py-1 ">
  <p className="font-medium text-[#062950]">Headers and Lists</p>

  <div className="relative flex flex-row items-center gap-2">
    <p className="font-medium text-[#062950]">Default</p>

    <ChevronDown
       className={`cursor-pointer transition-transform ${
                openDropdown === "headers" ? "rotate-180" : ""
              }`}
      onClick={() => toggleDropdown("headers")}
    />

    {openDropdown === "headers" && (
      <div className="absolute right-0   space-y-3 top-8 bg-[#FFFFFF] z-10 shadow-[var(--sds-size-depth-0)_var(--sds-size-depth-100)_var(--sds-size-depth-100)_var(--sds-size-depth-negative-100)_var(--sds-color-black-100),_var(--sds-size-depth-0)_var(--sds-size-depth-400)_var(--sds-size-depth-800)_var(--sds-size-depth-negative-100)_var(--sds-color-black-200)] rounded-md p-2 shadow-md w-64">
         <p className="p-1 hover:bg-gray-200 cursor-pointer">Default</p>
        <div className="flex flex-col ">
            <h4 className="p-1 hover:bg-gray-200 cursor-pointer">More</h4>
            <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1 whitespace-nowrap">
  Use lists and clear formatting
</p>
                    {/* <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1">
  Use lists and clear formatting
</p> */}
        </div>
         <div className="flex flex-col ">
            <h4 className="p-1 hover:bg-gray-200 cursor-pointer">More</h4>
            <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1 whitespace-nowrap">
  Use more paragraphs than lists
</p>
  
        </div>
      </div>
    )}
  </div>
</div>
            <div className="flex flex-row justify-between items-center py-1 ">
  <p className="font-medium text-[#062950]">Emoji</p>

  <div className="relative flex flex-row items-center gap-2">
    <p className="font-medium text-[#062950]">Default</p>

    <ChevronDown
       className={`cursor-pointer transition-transform ${
                openDropdown === "emoji" ? "rotate-180" : ""
              }`}
      onClick={() => toggleDropdown("emoji")}
    />

    {openDropdown === "emoji" && (
     <div className="absolute right-0   space-y-3 top-8 bg-[#FFFFFF] z-10 shadow-[var(--sds-size-depth-0)_var(--sds-size-depth-100)_var(--sds-size-depth-100)_var(--sds-size-depth-negative-100)_var(--sds-color-black-100),_var(--sds-size-depth-0)_var(--sds-size-depth-400)_var(--sds-size-depth-800)_var(--sds-size-depth-negative-100)_var(--sds-color-black-200)] rounded-md p-2 shadow-md w-64">
         <p className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">Default</p>
        <div className="flex flex-col ">
            <h4 className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">More</h4>
            <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1 whitespace-nowrap">
  Use more emojis
</p>
  
        </div>
         <div className="flex flex-col ">
            <h4 className="p-1 hover:bg-gray-200 hover:border hover:border-gray-300 hover:rounded-md transition-all duration-150 cursor-pointer">More</h4>
            <p className="text-[#BFBFBF] font-normal text-xs sm:text-sm md:text-base lg:text-base pt-1 whitespace-nowrap">
 Use less emojis
</p>
  
        </div>
      </div>
    )}
  </div>
</div>
       

       <div className="w-full flex justify-end mt-5">
  <div
    className="flex items-center justify-center px-4 py-1 w-[80px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">Save</p>
  </div>
</div>
<div className="my-40"/>
        </div>
       </div>
      </Modal>
      <Modal isOpen={isOpenD} onClose={() => setIsOpenD(false)}>
         <div className="py-8 ">
         <div className="flex justify-end w-full px-8">
  <div
    className="bg-[#E8E8E8] rounded-full p-1 w-fit cursor-pointer"
    onClick={() => setIsOpenD(false)}
  >
    <X color="black" />
  </div>
</div>
         <div className="flex flex-col items-center justify-center text-center h-full px-8">
  <HelpIndicator   className="w-12 h-12"/>

  <h2 className="font-bold text-black mt-3">
    Your account has been deleted
  </h2>

  <p className="font-medium text-black mt-2 max-w-md">
    We’ve successfully processed your account deletion request. Your data will be permanently removed after the recovery window ends. If this was a mistake, you can restore your account within the next 14 days.
    After that, everything will be permanently erased and cannot be recovered.
  </p>

  <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[160px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
    onClick={() => handleOpen(isOpenD, setIsOpenD, () => setIsOpen(false))}
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">
      Restore Account
    </p>
  </button>
</div>
        </div>

      </Modal>
     
    </div>
  )
}

export default page