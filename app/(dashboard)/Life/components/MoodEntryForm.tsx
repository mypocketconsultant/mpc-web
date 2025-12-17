import React, { useState } from 'react';
import { X, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MoodEntryForm() {
  const router = useRouter();
  const [overallMood, setOverallMood] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [journalText, setJournalText] = useState("");

  const moodEmojis = ["😰", "😟", "😕", "😐", "🙂", "😊", "🤗", "😍", "✨"];

  const handleSave = () => {
    console.log('Saving mood entry:', {
      overallMood,
      energyLevel,
      journalText,
      date: "Monday, 17. October",
      time: "08:00 am"
    });
  };

  return (
    <div className="lg:col-span-2">
      <div className=" bg-white rounded-3xl w-[800px] shadow-xs border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6  border-gray-100">
          <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors">
            Publish
          </button>
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-medium text-black mb-8 font-sans">
            How are you feeling today?
          </h1>

          {/* Overall Mood Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-gray-700">
                Overall Mood
              </label>
              <span className="text-base font-bold text-red-500">
                {overallMood}/10
              </span>
            </div>

            {/* Emoji Row */}
            <div className="flex justify-center items-center mb-4 px-1  rounded-lg">
              {moodEmojis.map((emoji, index) => {
                const moodValue = index + 1;
                const isActive = overallMood === moodValue;
                const isNearActive = Math.abs(overallMood - moodValue) <= 1;
                
                return (
                  <button
                    key={index}
                    onClick={() => setOverallMood(moodValue)}
                    className={`text-3xl transition-all duration-200 ${
                      isActive
                        ? "scale-125 opacity-100"
                        : isNearActive
                        ? "scale-100 opacity-70"
                        : "scale-90 opacity-40"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            {/* Mood Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={overallMood}
                onChange={(e) => setOverallMood(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #FCA5A5 0%, 
                    #FDBA74 20%,
                    #FCD34D 40%,
                    #BEF264 60%,
                    #86EFAC 80%,
                    #6EE7B7 100%)`,
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #EF4444;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #EF4444;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Energy Levels Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-gray-700">
                Energy Levels
              </label>
              <span className="text-base font-bold text-red-500">
                {energyLevel}/10 ⚡
              </span>
            </div>

            {/* Energy Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #BFDBFE 0%,
                    #A5B4FC 33%,
                    #C4B5FD 66%,
                    #DDD6FE 100%)`,
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #312E81;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #312E81;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Journal Entry */}
          <div className="mb-6 relative">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Tell me in your own words"
              className="w-160 h-35 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-14"
            />
            <button className="absolute right-9 top-3 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-colors">
              <Mic className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Date and Tags Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  Monday, 17. October
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  08:00 am
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                INTERVIEW
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                CAREER
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                DESIGN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}