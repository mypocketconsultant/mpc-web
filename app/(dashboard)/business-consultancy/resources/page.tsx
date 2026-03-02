"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, ArrowRightCircle, Loader2, Trash2 } from "lucide-react";
import Header from "@/app/components/header";
import DailyTips from "../components/DailyTips";
import tipsIcon from "@/public/tip.png";
import { apiService } from "@/lib/api/apiService";
import { deleteCanvas, deleteSwot } from "../canvas/canvasApi";

interface ResourceItem {
  id: string;
  type: "canvas" | "swot";
  name: string;
  resourceType: string;
  href: string;
}

function ResourceRow({
  doc,
  onDelete,
}: {
  doc: ResourceItem;
  onDelete: (id: string, type: "canvas" | "swot") => void;
}) {
  return (
    <div className="flex items-center gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors group">
      <ArrowRightCircle className="text-indigo-400 h-5 w-5 shrink-0" />
      <FileText className="text-gray-300 h-4 w-4 shrink-0" />
      <span className="text-gray-700 font-medium flex-1">{doc.name}</span>
      <span className="text-xs text-gray-400 shrink-0">{doc.resourceType}</span>
      <Link
        href={doc.href}
        className="text-xs text-indigo-900 underline decoration-indigo-200 underline-offset-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        Edit
      </Link>
      <button
        onClick={() => onDelete(doc.id, doc.type)}
        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ResourcesPage() {
  const [draftResources, setDraftResources] = useState<ResourceItem[]>([]);
  const [publishedResources, setPublishedResources] = useState<ResourceItem[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res: any = await apiService.get("/v1/business/resources");
        const data = res?.data ?? res;
        console.log("[Resources] API response:", JSON.stringify(data, null, 2));

        const allCreated = (data?.created_resources ?? []).map((r: any) => ({
          id: r.id,
          type: r.type as "canvas" | "swot",
          name: r.title || "Untitled",
          resourceType: r.type === "canvas" ? "Canvas" : "SWOT",
          href: r.type === "canvas"
            ? `/business-consultancy/canvas?canvas_id=${r.id}`
            : `/business-consultancy/swot?swot_id=${r.id}`,
          status: r.status ?? "draft",
        }));

        setDraftResources(allCreated.filter((r: any) => r.status === "draft"));
        setPublishedResources(allCreated.filter((r: any) => r.status === "published"));

        const docs = (data?.generated_documents ?? []).map((d: any) => ({
          id: d.id,
          type: "canvas" as "canvas" | "swot",
          name: d.filename || d.title || "Untitled",
          resourceType: "Document",
          href: d.storage?.url || "#",
        }));
        setGeneratedDocuments(docs);
      } catch (err: any) {
        console.error("[Resources] fetch error:", err.message, err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, []);

  const handleDelete = async (id: string, type: "canvas" | "swot") => {
    try {
      if (type === "canvas") {
        await deleteCanvas(id);
      } else {
        await deleteSwot(id);
      }
      setDraftResources((prev) => prev.filter((r) => r.id !== id));
      setPublishedResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("[Resources] delete error:", err.message, err);
    }
  };

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

            {/* Drafts */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Drafts</h2>
                <span className="text-sm text-gray-400">{draftResources.length} item{draftResources.length !== 1 ? "s" : ""}</span>
              </div>
              {draftResources.length === 0 ? (
                <p className="text-sm text-gray-400">No drafts yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {draftResources.map((doc) => (
                    <ResourceRow key={doc.id} doc={doc} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>

            <div className="w-full h-[1px] bg-gray-100" />

            {/* Published */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Published</h2>
                <span className="text-sm text-gray-400">{publishedResources.length} item{publishedResources.length !== 1 ? "s" : ""}</span>
              </div>
              {publishedResources.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing published yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {publishedResources.map((doc) => (
                    <ResourceRow key={doc.id} doc={doc} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>

            <div className="w-full h-[1px] bg-gray-100" />

            {/* Generated Documents */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Generated Documents</h2>
              </div>
              {generatedDocuments.length === 0 ? (
                <p className="text-sm text-gray-400">No generated documents yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {generatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors group"
                    >
                      <ArrowRightCircle className="text-indigo-400 h-5 w-5 shrink-0" />
                      <FileText className="text-gray-300 h-4 w-4 shrink-0" />
                      <span className="text-gray-700 font-medium flex-1">{doc.name}</span>
                      <Link
                        href={doc.href}
                        className="text-xs text-gray-400 underline decoration-gray-300 underline-offset-4"
                      >
                        see prompt history
                      </Link>
                    </div>
                  ))}
                </div>
              )}
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
