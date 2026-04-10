import React from 'react'
import { HelpIndicator } from '@/public/icons/HelpIndicator'
import Image from 'next/image'
import FinanceImage from '../../../../../public/Finance.png'
import LifeImage from '../../../../../public/Life.png'
import UserImage from '../../../../../public/tip.png'
import BusinessConsultancy from '../../../../../public/consultancy.png'
import StudySupport from '../../../../../public/StudySupport.png'
import { Pencil } from 'lucide-react';
const UserProfile = () => {
    const cardData = [
  {
    title: "Finance",
    buttonTitle: "Active",
    buttonColor: "#93CF92",
    image: FinanceImage,
    imgWidth: 160, 
    imgHeight: 80,
  },
  {
    title: "Life Advisory",
    buttonTitle: "Exploring",
    buttonColor: "#FFED90",
    image: LifeImage,
    imgWidth: 100, 
    imgHeight: 80,
  },
  {
    title: "Business Consultancy",
    buttonTitle: "Inactive",
    buttonColor: "#CFCFCF",
    image: BusinessConsultancy,
    imgWidth: 50, 
    imgHeight: 80,
  },
  {
    title: "Study Support",
    buttonTitle: "Paused",
    buttonColor: "#F67B81",
    image: StudySupport,
    imgWidth: 100, 
    imgHeight: 80,
  },
];
  return (
    <div className='mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200  '>
        <div className='flex flex-row gap-3'>
            <Image
                src={UserImage}
                alt="User Image"
                width={56}       
                height={56}     
                className="rounded-xl"
            />
            <div className='flex flex-row gap-2 items-center'>
                <h2 className='font-bold text-sm sm:text-base md:text-xl text-black'>John Doe</h2>
            <div className='flex flex-row gap-2 item-center'>
                <div className='my-1'>
                    <Pencil size={15}/>
                </div>
                <p className='font-black text-sm'>Edit</p>
            </div>
            </div>
        </div>
        <p className='text-black  text-sm py-2'>Early-career designer exploring global opportunities</p>
          <hr className="my-4 sm:my-2" />
        <h2 className='text-[#3566A2] font-bold text-[20px]'>Focus Modules</h2>
        <div className='flex flex-row gap-1 items-center py-1'>
            <HelpIndicator size={18}/>
        <h5 className='text-[#977400]  text-sm sm:text-base'>Your experience adapts based on what you’re focusing on.</h5>
        </div>
        <div className="flex flex-row  my-3">
 
<div className="flex flex-row flex-wrap gap-4">
  {cardData.map((card, index) => (
    <div
      key={index}
     className="bg-[#EDE6FF] px-3 py-1 rounded-xl flex justify-between items-center gap-4 flex-auto 
             w-full min-w-full max-w-none 
             md:min-w-[200px] md:max-w-[240px]"
    >
      {/* Left content */}
      <div className="flex flex-col gap-2">
        <p className="text-[#062950] font-bold text-[13px]">{card.title}</p>
        <div
          className="inline-flex justify-center items-center rounded-full px-4 py-1 self-start"
          style={{ backgroundColor: card.buttonColor }}
        >
          <p className="text-[#062950] text-[12px] font-medium m-0 whitespace-nowrap">
            {card.buttonTitle}
          </p>
        </div>
      </div>

      {/* Right content (image) */}
      {card.image && (
        <div className="flex items-center justify-center">
          <Image
            src={card.image}
            alt={`${card.title} Image`}
            style={{ 
              width: card.imgWidth || 80, 
              height: card.imgHeight || 80 
            }}
            className="rounded-xl block object-contain"
          />
        </div>
      )}
    </div>
  ))}
</div>
</div>
    </div>
  )
}

export default UserProfile