"use client";
import { useState, useRef, useEffect } from "react";

interface CustomDropdownProps {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CustomDropdown({
  options,
  placeholder,
  value,
  onChange,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative w-[20.72vw] h-[3.0rem] mb-[2vh] font-railway border border-[#79747E] text-[#A1A1A1] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center cursor-pointer text-[#49454F]">
        <span>{value || placeholder}</span>
        <span
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-[#79747E] rounded-[0.25rem] shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-[#F3F3F3] cursor-pointer text-[#49454F]"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}