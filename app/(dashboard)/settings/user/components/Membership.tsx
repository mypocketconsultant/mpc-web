import { Download } from '@/public/icons/Download'
import React from 'react'
import Image from 'next/image'
import ExportIcon from '@/public/download.png';
export const Membership = () => {
  return (
    <div className='mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200  '>
        <div className='flex gap-2 '>
  <h4 className='font-bold text-sm sm:text-base md:text-xl text-black'>Membership status</h4>
  <div className='bg-[#F8A6AA] px-1.5 py-0.5 rounded-[8px] text-[#062950]'>
    Free
  </div>
</div>
<p className="font-bold text-xs sm:text-sm md:text-base text-[#43A247]">
  Online
</p>

<div className="inline-flex items-center justify-center bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)] px-4 py-2 rounded-[10px] my-4">
  <p className='text-xs sm:text-base text-white m-0'>Upgrade to Pro</p>
</div>
    <div className=' flex flex-row gap-3  items-center' >
      <p className="font-bold text-xs sm:text-sm md:text-base text-black">
  Export my data
</p>
        <Download color='black' size={20}/>
         
    </div>
    </div>
  )
}

