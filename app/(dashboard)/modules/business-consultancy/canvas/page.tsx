"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, Trash2, MoreVertical, Plus } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

interface CanvasBlock {
  id: string;
  title: string;
  placeholder: string;
  color: string;
  colSpan?: number;
}

export default function BusinessCanvasPage() {
  const router = useRouter();
  const [documentTitle, setDocumentTitle] = useState("");

  const canvasBlocks: CanvasBlock[] = [
    {
      id: "cs",
      title: "Customer Segments",
      placeholder: "Who are you serving?",
      color: "bg-indigo-100",
      colSpan: 1,
    },
    {
      id: "vp",
      title: "Value Propositions",
      placeholder: "What problem are you solving?",
      color: "bg-yellow-200",
      colSpan: 2,
    },
    {
      id: "ch",
      title: "Channels",
      placeholder: "How do they reach you?",
      color: "bg-yellow-400",
      colSpan: 1,
    },

    {
      id: "rs",
      title: "Revenue Streams",
      placeholder: "What support or loyalty model?",
      color: "bg-green-100",
      colSpan: 1,
    },
    {
      id: "cr",
      title: "Customer Relationships",
      placeholder: "How do you make money?",
      color: "bg-indigo-100",
      colSpan: 1,
    },
    {
      id: "kr",
      title: "Key Resources",
      placeholder: "What assets do you need?",
      color: "bg-green-100",
      colSpan: 1,
    },
    {
      id: "ka",
      title: "Key Activities",
      placeholder: "Core actions to deliver the value",
      color: "bg-indigo-100",
      colSpan: 1,
    },

    {
      id: "kp",
      title: "Key Partnerships",
      placeholder: "Who helps you?",
      color: "bg-yellow-200",
      colSpan: 2,
    },
    {
      id: "cs2",
      title: "Cost Structure",
      placeholder: "Main expenses (staff, cloud, marketing, logistics)",
      color: "bg-indigo-100",
      colSpan: 1,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-white text-gray-800">
      <Header title="Business Consultancy" />

      <main className="flex-1 flex flex-col overflow-auto max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/modules/business-consultancy">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Business Consultancy</span>
            </button>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Business Canvas</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">New Document</span>
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
        <div className="mb-8">
          <input
            type="text"
            placeholder="Add document title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full text-2xl font-light text-gray-400 placeholder:text-gray-300 border-none outline-none bg-transparent"
          />
          <div className="w-full h-[1px] bg-gray-100 mt-2" />
        </div>

        {/* Canvas Grid */}
        <div className="flex-1 overflow-auto pb-8">
          <div className="grid grid-cols-4 gap-4 auto-rows-min pb-4 max-w-[1100px] mx-auto">
            {canvasBlocks.map((block) => (
              <div
                key={block.id}
                className={`bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden min-h-[140px]`}
                style={{ gridColumn: `span ${block.colSpan || 1}` }}
              >
                {/* Custom Header with specific rounded top corners to match design closely */}
                <div
                  className={`flex justify-between items-center px-4 py-2 ${block.color}`}
                >
                  <h3 className="text-xs font-bold text-indigo-900 mx-auto w-full text-center pl-8">
                    {block.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-60 text-indigo-900">
                    <button className="p-1 hover:bg-white/20 rounded-md">
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button className="p-1 hover:bg-white/20 rounded-md">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 border-b border-gray-200 pb-0.5">
                      {block.placeholder}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Card Button */}
            <button className="col-span-1 bg-gray-100/80 hover:bg-gray-200 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 transition-colors min-h-[140px]">
              <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center mb-2 bg-white">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Add Card</span>
            </button>
          </div>
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
