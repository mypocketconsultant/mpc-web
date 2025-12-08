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
  illustration: React.ReactNode;
  color: string;
}) => (
  <div className="rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex-shrink-0 w-[280px] h-[200px]"
    style={{ backgroundColor: color }}>
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h3 className="font-bold text-base text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-700">{subtitle}</p>
      </div>
      <div className="flex justify-between items-end flex-1">
        <button className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          {actionText}
        </button>
        <div className="w-20 h-20 flex items-center justify-center text-4xl">
          {illustration}
        </div>
      </div>
    </div>
  </div>
);

const RecommendedAction = () => (
  <div className="rounded-2xl p-5 shadow-sm border border-gray-100"
    style={{ backgroundColor: "#E8D5FF" }}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
        <BookOpen className="w-4 h-4" style={{ color: "#5A3FFF" }} />
      </div>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#5A3FFF" }}>
        <span className="text-white text-xs">●</span>
      </div>
    </div>
    <h4 className="font-bold text-gray-900 mb-1 text-sm">2-min read</h4>
    <p className="text-xs text-gray-700 mb-2">(Daily devotional)</p>
    <p className="text-xs text-gray-600">You can turn this option off in the settings</p>
  </div>
);

export default function ExpandToolkit() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
    <div className="w-full mt-10 mb-8">
      <div className="flex items-start justify-between gap-6">
        {/* Main Toolkit Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Expand your toolkit.</h2>
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
            className="flex gap-4 overflow-x-auto bg-white p-3 shadow rounded-lg"
            onScroll={checkScroll}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <ToolkitCard
              title="Finance"
              subtitle="Build a 5-min Budget"
              actionText="Try now"
              color="#F0E6FF"
              illustration="💰"
            />
            <ToolkitCard
              title="Life Advisory"
              subtitle="Reflect: 3 min"
              actionText="Get insights"
              color="#E8D5FF"
              illustration="🧘"
            />
            <ToolkitCard
              title="Study Support"
              subtitle="Plan a 12-week study schedule"
              actionText="Try 3 min"
              color="#E8D5FF"
              illustration="📚"
            />
            <ToolkitCard
              title="Wellness"
              subtitle="Track your daily habits"
              actionText="Start today"
              color="#F0E6FF"
              illustration="🌟"
            />
            <ToolkitCard
              title="Career"
              subtitle="Build your career path"
              actionText="Explore"
              color="#E8D5FF"
              illustration="🎯"
            />
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="w-72 bg-white p-3 shadow flex-shrink-0">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Recommended actions</h3>
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