"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Plus } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

interface SwotBlock {
  id: string;
  title: string;
  colorClass: string;
  texts: string[];
}

export default function SwotPage() {
  const [documentTitle, setDocumentTitle] = useState("");

  const swotData: SwotBlock[] = [
    {
      id: "S",
      title: "STRENGTHS",
      colorClass: "bg-[#5A3FFF] text-white",
      texts: ["Add texts", "Add texts", "Add texts"],
    },
    {
      id: "W",
      title: "WEAKNESSES",
      colorClass: "bg-[#D4B333] text-white",
      texts: ["Add texts", "Add texts", "Add texts"],
    },
    {
      id: "O",
      title: "OPPORTUNITIES",
      colorClass: "bg-[#4CAF50] text-white",
      texts: ["Add texts", "Add texts"],
    },
    {
      id: "T",
      title: "THREATS",
      colorClass: "bg-[#E53935] text-white",
      texts: ["Add texts", "Add texts"],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-[#fbfbfb] text-gray-800">
      <Header title="Business Consultancy" />

      <main className="flex-1 flex flex-col overflow-auto max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/business-consultancy">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Business Consultancy / SWOT</span>
            </button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <button className="bg-gradient-to-r from-[#4A247c] to-[#2E154E] hover:from-[#3A1C62] hover:to-[#220F3A] text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md">
            Publish
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-indigo-900">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add document title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full text-xl font-light text-gray-400 placeholder:text-gray-300 border-none outline-none bg-transparent"
          />
          <div className="w-full h-[1px] bg-gray-200 mt-2" />
        </div>

        {/* SWOT Grid */}
        <div className="flex-1 w-full max-w-[1000px] mx-auto grid grid-cols-2 grid-rows-2">
          {swotData.map((block, index) => (
            <div
              key={block.id}
              className={`relative flex flex-col items-center justify-center min-h-[250px] p-6
                ${index === 0 ? "border-r border-b border-gray-200" : ""}
                ${index === 1 ? "border-b border-gray-200" : ""}
                ${index === 2 ? "border-r border-gray-200" : ""}
              `}
            >
              {/* Floating texts */}
              <div className="absolute top-8 w-full flex justify-center gap-6 flex-wrap px-8">
                {block.texts.map((t, i) => (
                  <div
                    key={i}
                    className="bg-blue-50/50 text-gray-300 text-xs px-4 py-1.5 rounded-md mix-blend-multiply"
                  >
                    {t}
                  </div>
                ))}
              </div>

              {/* Center Title Badge */}
              <div className="mt-12 flex flex-col items-center">
                <div
                  className={`px-6 py-2 rounded-xl font-bold tracking-wider text-sm shadow-sm ${block.colorClass}`}
                >
                  {block.title}
                </div>

                <button className="mt-3 flex items-center gap-1 text-xs text-indigo-900 hover:text-indigo-700 transition-colors font-medium underline decoration-indigo-200 underline-offset-4">
                  <Plus className="h-3 w-3" />
                  Add more text boxes
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Input Footer */}
      <div className="bg-white border-t border-gray-100 pb-safe">
        <InputFooter
          placeholder="Ask me to suggest a business name.."
          onSend={(msg) => console.log(msg)}
          context="business-consultancy"
        />
      </div>
    </div>
  );
}
