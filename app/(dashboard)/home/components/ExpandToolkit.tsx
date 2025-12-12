"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const ToolkitCard = ({
  title,
  subtitle,
  actionText,
  illustration,
  color,
}: {
  title: string;
  subtitle: string;
  actionText: string;
  illustration: string;
  color: string;
}) => (
  <div
    className="rounded-2xl p-3  border border-gray-100 hover:shadow-lg transition-all flex-shrink-0 w-[280px] h-[200px] relative flex flex-col justify-between"
    style={{ backgroundColor: color }}
  >
    <div className="absolute top-6 right-1 w-30 h-30">
      <img
        src={illustration}
        alt={title}
        className="w-full h-full object-contain"
      />
    </div>
    <div className="pr-28">
      <h3 className="font-bold text-[20px] text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-700 line-clamp-2">{subtitle}</p>
    </div>
    <button className="text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors w-fit px-4 py-3 rounded-full bg-white">
      {actionText}
    </button>
  </div>
);

const RecommendedAction = () => (
  <div
    className="rounded-2xl p-4  mt-6 border  border-gray-100"
    style={{ backgroundColor: "#E8D5FF" }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-5 h-5" style={{ color: "#5A3FFF" }} />
      </div>
      <div className="flex justify-end">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#5A3FFF] to-[#300878] flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-white">→</span>
        </div>
      </div>
    </div>
    <h4 className="font-bold text-gray-900 mb-2 text-base">2-min read</h4>
    <p className="text-sm  text-gray-700 mb-3" style={{ color: "#5A3FFF" }}>
      (Daily devotional)
    </p>
    <p className="text-sm max-w-28 text-gray-700 leading-relaxed">
      You can turn this option off in the settings
    </p>
  </div>
);

export default function ExpandToolkit() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Initial check after component mounts and content loads
    const timer = setTimeout(checkScroll, 100);

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      return () => {
        clearTimeout(timer);
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  return (
    <div className="w-full mt-20 mb-8">
      <div className="flex items-start justify-between gap-6">
        {/* Main Toolkit Section */}
        <div className="flex-1 bg-white shadow-md p-5 rounded-lg min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Expand your toolkit.
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto  p-3  rounded-lg"
            onScroll={checkScroll}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <ToolkitCard
              title="Finance"
              subtitle="Build a 5-min Budget"
              actionText="Try now"
              color="#F0E6FF"
              illustration="/Finance.png"
            />
            <ToolkitCard
              title="Life Advisory"
              subtitle="Reflect: 3 min"
              actionText="Get insights"
              color="#E8D5FF"
              illustration="/Life.png"
            />
            <ToolkitCard
              title="Study Support"
              subtitle="Plan a 12-week study schedule"
              actionText="Try 3 min"
              color="#E8D5FF"
              illustration="/Life.png"
            />
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="w-60 bg-white p-3 py-5 shadow-md rounded-lg flex-shrink-0">
          <h3 className="font-bold text-gray-900 mb-4 text-base">
            Recommended actions
          </h3>
          <RecommendedAction />
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
