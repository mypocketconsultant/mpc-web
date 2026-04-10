
import React from 'react'
import { Check } from 'lucide-react';
import Image from 'next/image';
const page = () => {
  const services = [
  "Career Advisory",
  "Study Support",
  "Life Advisory",
  "Business Consultancy",
  "Financial Literacy",
  "Social Impact",
  "Faith (Optional)",
];
  return (
    <div className='flex flex-col h-full'>
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full ">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8   bg-[url('/price.png')]  ">
          <Image
            src="/logo.png"
            alt="Logo"
            className="w-20 h-auto sm:w-25 md:w-30 lg:w-32"
            width={167}
            height={30}
          />
          <h6 className='text-center text-black font-medium my-5'>Start for free. Upgrade to get the capacity that exactly matches your needs.</h6>
       
     <div className='flex flex-row items-center justify-center gap-4 mt-6 flex-wrap'>
       <div className='bg-[#FCFCFF] shadow-[0_4px_8px_-1px_rgba(0,0,0,0.1),0_8px_16px_-1px_rgba(0,0,0,0.2)] rounded-md p-4 w-[321px] '>
        <div className="
        
       bg-[conic-gradient(from_221.17deg_at_120.36%_23.11%,#5A3FFF_0deg,#D4AF37_133.27deg,#300878_253.48deg,#5A3FFF_360deg)]
        p-4 rounded-nd
        "
     
        >
        <div className='py-5'/>
        {/* text flex */}
           <h4 className='text-[#FCFCFF]  text-2xl  font-bold  text-end'>Free</h4>
             <p className='text-[#FCFCFF]  font-medium  text-end'>Forever</p>
      <p className='text-[#FCFCFF] text-[12px] py-1'>
  Discover what My Pocket Consultant  <br/>can do for you
</p>
<div className="flex flex-col gap-2 my-1">
  {services.map((item, index) => (
    <div key={index} className="flex flex-row gap-2 items-center">
      <div className="rounded-full p-0.1 bg-[white]">
        <Check color="#300878" size={15} />
      </div>
      <p className="text-[#FFFFFF] font-regular">{item}</p>
    </div>
  ))}
</div>
<div className="flex item-center justify-center   w-full h-full mt-2 ">
 <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[120px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#5A3FFF]"
   
  >
    <p className="text-xs sm:text-base text-white m-0 font-medium">Get Started</p>
  </button>
  </div>
        </div>
      </div>
       <div className='bg-[#FCFCFF] shadow-[0_4px_8px_-1px_rgba(0,0,0,0.1),0_8px_16px_-1px_rgba(0,0,0,0.2)] rounded-md p-4 w-[321px] '>
        <div className="
        
       bg-[conic-gradient(from_221.17deg_at_120.36%_23.11%,#5A3FFF_0deg,#D4AF37_133.27deg,#300878_253.48deg,#5A3FFF_360deg)]
        p-4 rounded-nd
        "
     
        >
        <div className='py-5'/>
        {/* text flex */}
           <h4 className='text-[#FCFCFF]  text-2xl  font-bold  text-end'>₦19,000</h4>
             <p className='text-[#FCFCFF]  font-medium  text-end'>/ month</p>
      <p className='text-[#FCFCFF] text-[12px]  my-2'>
  What’s included?
</p>
<div className="flex flex-col gap-2 my-4">
  {services.map((item, index) => (
    <div key={index} className="flex flex-row gap-2 items-center">
      <div className="rounded-full p-0.1 bg-[white]">
        <Check color="#300878" size={15} />
      </div>
      <p className="text-[#FFFFFF] font-regular  ">{item}</p>
    </div>
  ))}
</div>
<div className="flex flex-col items-center justify-center   w-full h-full mt-2 gap-1 ">
  <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[160px] rounded-[10px]  hover:opacity-90 active:scale-95 transition-all bg-[#5A3FFF]"
   
  >
   <div className='flex flex-row gap-2 items-center'>
     <p className="text-xs sm:text-base text-[#FEFDF9] m-0 font-medium">200 Credits  </p>
      <div className="rounded-full p-0.1 bg-[white] w-fit">
        <Check color="#300878" size={15} />
      </div>
   </div>
  </button>
 <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[120px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#FDFDFF]"
   
  >
    <p className="text-xs sm:text-base text-[#6549CC] m-0 font-medium">Get Started</p>
  </button>
  </div>
        </div>
      </div>
       <div className='bg-[#FCFCFF] shadow-[0_4px_8px_-1px_rgba(0,0,0,0.1),0_8px_16px_-1px_rgba(0,0,0,0.2)] rounded-md p-4 w-[321px] '>
        <div className="
        
       bg-[conic-gradient(from_221.17deg_at_120.36%_23.11%,#5A3FFF_0deg,#D4AF37_133.27deg,#300878_253.48deg,#5A3FFF_360deg)]
        p-4 rounded-nd
        "
     
        >
        <div className='py-5'/>
        {/* text flex */}
           <h4 className='text-[#FCFCFF]  text-2xl  font-bold  text-end'>₦190,000</h4>
             <p className='text-[#FCFCFF]  font-medium  text-end'>/month</p>
      <p className='text-[#FCFCFF] text-[12px] '>
   What’s included?
</p>
<div className="flex flex-col gap-2 my-1">
  {services.map((item, index) => (
    <div key={index} className="flex flex-row gap-2 items-center">
      <div className="rounded-full p-0.1 bg-[white]">
        <Check color="#300878" size={15} />
      </div>
      <p className="text-[#FFFFFF] font-regular">{item}</p>
    </div>
  ))}
</div>
<div className="flex flex-col items-center justify-center   w-full h-full mt-2 gap-1 ">
  <button
    className="mt-5 flex flex-row  gap-2 items-center justify-center px-4 py-2 w-[140px] rounded-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-[#9399FF]"
   
  >
    <p className="text-xs sm:text-base text-[#FEFDF9] m-0 font-medium">100 Credits  </p>
      <div className="rounded-full p-0.1 bg-[white] w-fit">
        <Check color="#300878" size={15} />
      </div>
  </button>
 <button
    className="mt-5 flex items-center justify-center px-4 py-2 w-[120px] rounded-[10px]  hover:opacity-90 active:scale-95 transition-all bg-[#FDFDFF]"
   
  >
    <p className="text-xs sm:text-base text-[#6549CC] m-0 font-medium">Get Started</p>
  </button>
  </div>
        </div>
      </div>
     </div>
     </div>
      </main>
    </div>
  )
}

export default page