"use client";

import { useState, useEffect } from "react";

interface MoodSelectorProps {
  onMoodSelect?: (mood: number) => void;
  initialMood?: number | null;
}

export default function MoodSelector({ onMoodSelect, initialMood = null }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(initialMood);

  useEffect(() => {
    if (initialMood !== null) {
      setSelectedMood(initialMood);
    }
  }, [initialMood]);

  const moods = [
    { emoji: "😢", label: "Very sad" },
    { emoji: "😞", label: "Sad" },
    { emoji: "😕", label: "Okay" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😊", label: "Happy" },
    { emoji: "😄", label: "Very happy" },
    { emoji: "🤗", label: "Excited" },
    { emoji: "🎉", label: "Celebratory" },
    { emoji: "✨", label: "Amazing" },
  ];

  const handleMoodSelect = (index: number) => {
    setSelectedMood(index);
    onMoodSelect?.(index);
  };

 return (
    <div className="w-full max-w-2xl mx-auto  rounded-2xl p-8 mb-8">
     

      {/* Score Display */}
      <div className="flex justify-end mb-4">
        <span className="text-sm font-medium text-red-500">
          {selectedMood !== null ? `${selectedMood + 1}/10` : "1/10"}
        </span>
      </div>

      {/* Mood Emojis */}
      <div className="flex justify-between items-center mb-4 px-2">
        {moods.map((mood, index) => {
          const isActive = selectedMood === index;
          const isNearActive = selectedMood !== null && Math.abs(selectedMood - index) <= 1;

          return (
            <button
              key={index}
              onClick={() => handleMoodSelect(index)}
              className={`text-3xl transition-all duration-200 ${
                isActive
                  ? "scale-125 opacity-100"
                  : isNearActive
                    ? "scale-100 opacity-70"
                    : "scale-90 opacity-40"
              }`}
              title={mood.label}
            >
              {mood.emoji}
            </button>
          );
        })}
      </div>

      {/* Slider Track */}
      <div className="relative">
        <div className="h-1 bg-pink-200 rounded-full" />
        <input
          type="range"
          min="0"
          max="9"
          value={selectedMood ?? 0}
          onChange={(e) => handleMoodSelect(parseInt(e.target.value))}
          className="absolute top-0 left-0 w-full h-1 appearance-none bg-transparent cursor-pointer"
          style={{
            WebkitAppearance: "none",
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #FFC0CB;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #FFC0CB;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          `}</style>
        </div>
      </div>
    );
  }