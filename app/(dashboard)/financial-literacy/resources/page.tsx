"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";

// ── Types — aligned exactly with backend serializers ──────

interface GeneratedDocument {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  file_type: "pdf" | "xlsx" | "docx";
  status: "processing" | "ready" | "failed";
  storage: {
    provider?: string;
    url?: string | null;
    key?: string | null;
    public_id?: string | null;
  };
  created_at: string;
}

interface UserUpload {
  id: string;
  user_id: string;
  filename: string;
  content_type: string;
  size: number;
  module: string;
  status: "uploaded" | "parsing" | "parsed" | "failed";
  created_at: string;
}

interface ResourcesResponse {
  generated_documents: GeneratedDocument[];
  user_uploads: UserUpload[];
  window: string;
}

// _serialize_insight returns: id, user_id, title, subtitle, kind, tone, metric, range, created_at
interface InsightItem {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  kind: "spend_alert" | "savings_tip" | "trend" | string;
  tone: "positive" | "warning" | "neutral" | string;
  metric: Record<string, unknown> | null;
  range: string;
  created_at: string;
}

interface InsightsResponse {
  items: InsightItem[];
  range: string;
}

type WindowFilter = "all_time" | "a_month_ago" | "a_year_ago";
type InsightRange = "7d" | "30d" | "90d";

// ── Constants ──────────────────────────────────────────────

const WINDOW_OPTIONS: { value: WindowFilter; label: string }[] = [
  { value: "all_time", label: "All Time" },
  { value: "a_month_ago", label: "This Month" },
  { value: "a_year_ago", label: "This Year" },
];

const INSIGHT_RANGE_OPTIONS: { value: InsightRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  xlsx: "bg-green-100 text-green-700",
  docx: "bg-blue-100 text-blue-700",
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function InsightIcon({ kind }: { kind: string }) {
  if (kind === "spend_alert") return <TrendingDown className="w-4 h-4" />;
  if (kind === "savings_tip") return <Lightbulb className="w-4 h-4" />;
  if (kind === "trend") return <BarChart3 className="w-4 h-4" />;
  return <TrendingUp className="w-4 h-4" />;
}

function insightToneStyles(tone: string): { card: string; icon: string; badge: string } {
  if (tone === "positive")
    return {
      card: "border-green-100 bg-green-50",
      icon: "bg-green-100 text-green-600",
      badge: "bg-green-100 text-green-700",
    };
  if (tone === "warning")
    return {
      card: "border-amber-100 bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      badge: "bg-amber-100 text-amber-700",
    };
  return {
    card: "border-gray-100 bg-white",
    icon: "bg-[#EEF2FF] text-[#5A3FFF]",
    badge: "bg-gray-100 text-gray-600",
  };
}

// ── Component ──────────────────────────────────────────────

export default function SavedResourcesPage() {
  const [activeWindow, setActiveWindow] = useState<WindowFilter>("all_time");
  const [resourcesData, setResourcesData] = useState<ResourcesResponse | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  const [userUploads, setUserUploads] = useState<UserUpload[]>([]);

  const [insightRange, setInsightRange] = useState<InsightRange>("30d");
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const fetchResources = useCallback(async (w: WindowFilter) => {
    try {
      setResourcesLoading(true);
      setResourcesError(null);
      const res: any = await apiService.get(
        `/v1/finance/resources?window=${w}&limit=100`
      );
      const payload = res?.data || res;
      console.log("[SavedResources] /v1/finance/resources →", payload);
      setResourcesData(payload);
      setUserUploads(payload?.user_uploads ?? []);
    } catch (err) {
      console.error("[SavedResources] /v1/finance/resources error →", err);
      setResourcesError("Could not load resources.");
      setResourcesData(null);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async (r: InsightRange) => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      const res: any = await apiService.get(
        `/v1/finance/insights?range=${r}&limit=50`
      );
      const payload: InsightsResponse = res?.data || res;
      console.log("[SavedResources] /v1/finance/insights →", payload);
      setInsights(payload?.items ?? []);
    } catch (err) {
      console.error("[SavedResources] /v1/finance/insights error →", err);
      setInsightsError("Could not load insights.");
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  // Fetch both in parallel on mount
  useEffect(() => {
    fetchResources(activeWindow);
    fetchInsights(insightRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchResources(activeWindow);
  }, [activeWindow, fetchResources]);

  useEffect(() => {
    fetchInsights(insightRange);
  }, [insightRange, fetchInsights]);

  const generatedDocs = [...(resourcesData?.generated_documents ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">

          {/* Back nav */}
          <Link href="/financial-literacy">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Finance Literacy / Insights & Resources</span>
            </button>
          </Link>

          {/* Page title + window filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insights & Resources</h1>
              <p className="text-sm text-gray-500 mt-1">
                Your insights and generated documents
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {WINDOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveWindow(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeWindow === opt.value
                      ? "bg-[#5A3FFF] text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#5A3FFF] hover:text-[#5A3FFF]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Section 1: Financial Insights ── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#5A3FFF]" />
                Financial Insights
                {!insightsLoading && (
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({insights.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-1.5">
                {INSIGHT_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setInsightRange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      insightRange === opt.value
                        ? "bg-[#5A3FFF] text-white"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-[#5A3FFF] hover:text-[#5A3FFF]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {insightsLoading ? (
              <div className="flex items-center justify-center py-10 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="w-5 h-5 text-[#5A3FFF] animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading insights…</span>
              </div>
            ) : insightsError ? (
              <div className="flex items-center justify-between py-4 px-5 bg-white rounded-2xl border border-gray-100">
                <span className="text-sm text-gray-500">{insightsError}</span>
                <button
                  onClick={() => fetchInsights(insightRange)}
                  className="flex items-center gap-1.5 text-xs text-[#5A3FFF] hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 text-center">
                <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">No insights yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Insights are generated as you add transactions and budgets
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight) => {
                  const styles = insightToneStyles(insight.tone);
                  return (
                    <div
                      key={insight.id}
                      className={`rounded-2xl border p-5 ${styles.card}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}>
                          <InsightIcon kind={insight.kind} />
                        </div>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles.badge}`}>
                          {insight.kind?.replace("_", " ") ?? "insight"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h3>
                      {insight.subtitle && (
                        <p className="text-xs text-gray-500">{insight.subtitle}</p>
                      )}
                      {insight.metric && Object.keys(insight.metric).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-black/5 flex flex-wrap gap-x-4 gap-y-1">
                          {Object.entries(insight.metric).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 capitalize">
                                {k.replace(/_/g, " ")}:
                              </span>
                              <span className="text-[10px] font-semibold text-gray-700">
                                {typeof v === "number" && k.includes("amount")
                                  ? formatCurrency(v)
                                  : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Resources loading / error */}
          {resourcesLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin mb-4" />
              <p className="text-gray-500">Loading resources…</p>
            </div>
          )}

          {resourcesError && !resourcesLoading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 mb-6">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-gray-700 font-medium">{resourcesError}</p>
              <button
                onClick={() => fetchResources(activeWindow)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {!resourcesLoading && !resourcesError && (
            <>
              {/* ── Section 2: Generated Documents ── */}
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5A3FFF]" />
                  Generated Documents
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({generatedDocs.length})
                  </span>
                </h2>

                {generatedDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No documents yet</p>
                    <p className="text-xs text-gray-400 mt-1 mb-3">
                      Export a report to see it here
                    </p>
                    <Link href="/financial-literacy/reports">
                      <button className="px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors">
                        Go to Reports
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {doc.title || doc.filename}
                            </p>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                FILE_TYPE_COLORS[doc.file_type] ??
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {doc.file_type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {doc.filename} · {formatDate(doc.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {doc.status === "processing" && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Generating…
                            </span>
                          )}
                          {doc.status === "ready" && (
                            <>
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Ready
                              </span>
                              {doc.storage?.url && (
                                <a
                                  href={doc.storage.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5A3FFF] text-white rounded-lg hover:bg-[#4930CC] transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </a>
                              )}
                            </>
                          )}
                          {doc.status === "failed" && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Uploaded Documents */}
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Uploaded Documents
                </h2>

                {userUploads.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                    <p className="text-sm text-gray-500">No documents uploaded in the finance module yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                              {upload.filename}
                            </p>
                            <p className="text-xs text-gray-400">
                              {upload.status} · {upload.size ? `${Math.round(upload.size / 1024)} KB` : ""}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          upload.status === "parsed" ? "bg-green-50 text-green-700"
                          : upload.status === "failed" ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {upload.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
