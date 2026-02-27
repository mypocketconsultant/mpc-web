"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, ArrowRightCircle, Loader2 } from "lucide-react";
import Header from "@/app/components/header";
import DailyTips from "../components/DailyTips";
import tipsIcon from "@/public/tip.png";
import { apiService } from "@/lib/api/apiService";

interface ResourceItem {
  id: string;
  name: string;
  type: string;
  href: string;
}

export default function ResourcesPage() {
  const [createdResources, setCreatedResources] = useState<ResourceItem[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res: any = await apiService.get("/v1/business/resources");
        const data = res?.data ?? res;
        console.log("[Resources] raw API response:", JSON.stringify(data, null, 2));

        // Map created_resources (swot + canvas)
        const created = (data?.created_resources ?? []).map((r: any) => ({
          id: r.id,
          name: r.title || "Untitled",
          type: "Edit",
          href: r.type === "canvas"
            ? `/business-consultancy/canvas?canvas_id=${r.id}`
            : `/business-consultancy/swot?swot_id=${r.id}`,
        }));
        console.log("[Resources] created_resources mapped:", created);
        setCreatedResources(created);

        // Map generated_documents
        const docs = (data?.generated_documents ?? []).map((d: any) => ({
          id: d.id,
          name: d.filename || d.title || "Untitled",
          type: "see prompt history",
          href: d.storage?.url || "#",
        }));
        console.log("[Resources] generated_documents mapped:", docs);
        setGeneratedDocuments(docs);
      } catch (err: any) {
        console.error("[Resources] fetch error:", err.message, err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-white text-gray-800">
      <Header title="Business Consultancy" />

      <main className="flex-1 overflow-auto max-w-[1100px] mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/business-consultancy">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Business Consultancy / Resources</span>
          </button>
        </Link>

        <div className="w-full h-[1px] bg-gray-100 mb-10" />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#4A247c] animate-spin" />
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 mb-8 ${isLoading ? "hidden" : ""}`}>
          {/* Main Docs Section - Left Side */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Created Resources */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Created resources
                </h2>
                <Link
                  href="#"
                  className="text-sm text-gray-400 underline decoration-gray-300 underline-offset-4"
                >
                  see all..
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {createdResources.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors group"
                  >
                    <ArrowRightCircle className="text-indigo-400 h-5 w-5 shrink-0" />
                    <FileText className="text-gray-300 h-4 w-4 shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {doc.name}
                    </span>
                    <Link
                      href={doc.href}
                      className="text-xs text-indigo-900 underline decoration-indigo-200 underline-offset-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {doc.type}
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <div className="w-full h-[1px] bg-gray-100" />

            {/* Generated Documents */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Generated Documents
                </h2>
                <Link
                  href="#"
                  className="text-sm text-gray-400 underline decoration-gray-300 underline-offset-4"
                >
                  see all..
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {generatedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors group"
                  >
                    <ArrowRightCircle className="text-indigo-400 h-5 w-5 shrink-0" />
                    <FileText className="text-gray-300 h-4 w-4 shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {doc.name}
                    </span>
                    <Link
                      href={doc.href}
                      className="text-xs text-gray-400 underline decoration-gray-300 underline-offset-4"
                    >
                      {doc.type}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Daily Tips Side Panel */}
          <div>
            <DailyTips
              dailyTip={{
                title: "Say NO",
                description:
                  "Say no to opportunities that don't align with your core goal.",
              }}
              tipsIcon={tipsIcon}
              title="Daily tips"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
