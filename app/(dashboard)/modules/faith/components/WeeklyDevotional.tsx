import React from 'react';

type DevotionalItem = {
  title: string;
  time: string;
  description: string;
};

type DevotionalDay = {
  month: string;
  date: number;
  items: DevotionalItem[];
  monthBgColor?: string;
};

type WeeklyDevotionalProps = {
  days: DevotionalDay[];
  onEdit?: (dayIndex: number, itemIndex: number, item: DevotionalItem) => void;
};

const WeeklyDevotional: React.FC<WeeklyDevotionalProps> = ({ days ,  onEdit }) => {
  return (
    <div className="flex flex-col gap-6 cursor-pointer">
      {days.map((day, dayIndex) => {
        // Filter out empty devotional items
        const validItems = day.items.filter(
          item => item.title || item.time || item.description
        );

        return (
          <div key={dayIndex} className="flex flex-row gap-2 items-start">
            {/* Month / Date always shows */}
            <div
              className="flex flex-col items-center px-2 py-6 rounded-md"
              style={{ backgroundColor: day.monthBgColor || '#F6F0E9' }}
            >
              <h6 className="text-[#3B3E45] font-bold">{day.month}</h6>
              <h6 className="text-[#3B3E45] font-bold">{day.date}</h6>
            </div>

            {/* Only render devotional items if they exist */}
            {validItems.length > 0 &&
              validItems.map((item, index) => (
                <div
                  key={index}
                  className={`border-l-[5px] border-[#C1A888] rounded-l-3xl ${
                    index !== 0 ? '-mt-2' : ''
                  }`}
                >
                  <div className="bg-[#FCFCFF] w-[340px] py-3 px-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex flex-row justify-between items-center gap-3">
                      <p className="font-bold text-black">{item.title}</p>
                      <p className="text-[#3B3E45] font-medium">{item.time}</p>
                      <p className="text-[#656565] text-sm sm:text-base font-bold underline underline-offset-2 cursor-pointer mb-2 font-medium"
                       onClick={() => onEdit?.(dayIndex, index, item)}
                      >
                        Click to edit
                      </p>
                    </div>
                    <p className="whitespace-pre-line">{item.description}</p>
                  </div>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyDevotional;