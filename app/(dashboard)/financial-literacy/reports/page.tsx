"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  PieChart,
  ArrowUpDown,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";

// ── Types (aligned with backend) ──────────────────────────

interface Transaction {
  id: string;
  user_id: string;
  budget_id: string | null;
  name: string;
  direction: "income" | "expense";
  category: string | null;
  subcategory: string | null;
  target_amount: number | null;
  actual_amount: number;
  currency: string;
  date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface BudgetRow {
  name: string;
  target_amount: number;
  actual_amount?: number | null;
}

interface BudgetDoc {
  id: string;
  title: string | null;
  period: string | null;
  currency: string;
  groups: Record<string, { rows: BudgetRow[] }>;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CurrencyGroup {
  currency: string;
  breakdown: CategoryBreakdown[];
  subtotalExpenses: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  avgMonthlySavings: number;
  savingsRate: number;
  monthCount: number;
}

interface ExportStatus {
  docId: string | null;
  status: "idle" | "processing" | "ready" | "failed";
  downloadUrl: string | null;
  error: string | null;
}

// ── Constants ─────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Rent: "#EF4444",
  Groceries: "#F59E0B",
  Utilities: "#3B82F6",
  Transportation: "#8B5CF6",
  Entertainment: "#EC4899",
  Healthcare: "#10B981",
  Education: "#06B6D4",
  Shopping: "#F97316",
  "Other Expenses": "#6B7280",
  Salary: "#10B981",
  Freelance: "#3B82F6",
  Investments: "#8B5CF6",
  Business: "#F59E0B",
  "Other Income": "#6B7280",
};

const DEFAULT_COLOR = "#9CA3AF";

const PERIOD_OPTIONS = [
  { value: "1month", label: "1 Month", months: 1 },
  { value: "3months", label: "3 Months", months: 3 },
  { value: "6months", label: "6 Months", months: 6 },
  { value: "1year", label: "1 Year", months: 12 },
];

const REPORT_TYPES = [
  {
    id: "category",
    title: "Category Breakdown",
    description: "Expenses grouped by category",
    icon: PieChart,
  },
  {
    id: "monthly",
    title: "Monthly Overview",
    description: "Income vs expenses by month",
    icon: BarChart3,
  },
  {
    id: "trends",
    title: "Trends",
    description: "Spending trends over time",
    icon: TrendingUp,
  },
  {
    id: "comparison",
    title: "Period Comparison",
    description: "Compare with previous period",
    icon: ArrowUpDown,
  },
];

// ── Helpers ───────────────────────────────────────────────

function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getMonthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function filterByPeriod(
  transactions: Transaction[],
  months: number,
): Transaction[] {
  const cutoff = getMonthsAgo(months);
  return transactions.filter((t) => {
    if (!t.date) return false;
    return new Date(t.date) >= cutoff;
  });
}

function buildCategoryBreakdown(
  transactions: Transaction[],
  planRowNames?: string[],
): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.direction === "expense");
  const categoryMap = new Map<string, number>();

  // If plan rows provided, seed them all at 0 so every row shows
  if (planRowNames && planRowNames.length > 0) {
    for (const name of planRowNames) {
      categoryMap.set(name, 0);
    }
  }

  for (const t of expenses) {
    const cat = t.category || "Other Expenses";
    // Match case-insensitively to plan rows if available
    if (planRowNames && planRowNames.length > 0) {
      const match = planRowNames.find(
        (r) => r.toLowerCase() === cat.toLowerCase(),
      );
      if (match) {
        categoryMap.set(match, (categoryMap.get(match) || 0) + t.actual_amount);
      } else {
        // Transaction category doesn't match any plan row — group under "Other"
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.actual_amount);
      }
    } else {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.actual_amount);
    }
  }

  const total = Array.from(categoryMap.values()).reduce((sum, v) => sum + v, 0);
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: CATEGORY_COLORS[category] || DEFAULT_COLOR,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildCategoryBreakdownByCurrency(
  transactions: Transaction[],
): CurrencyGroup[] {
  const currencies = [
    ...new Set(transactions.map((t) => t.currency).filter(Boolean)),
  ].sort();
  return currencies.map((currency) => {
    const currencyTx = transactions.filter((t) => t.currency === currency);
    const breakdown = buildCategoryBreakdown(currencyTx);
    const subtotalExpenses = currencyTx
      .filter((t) => t.direction === "expense")
      .reduce((sum, t) => sum + t.actual_amount, 0);
    return { currency, breakdown, subtotalExpenses };
  });
}

function buildMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthMap = new Map<
    string,
    { income: number; expenses: number; sortKey: string }
  >();

  for (const t of transactions) {
    if (!t.date) continue;
    const key = getMonthKey(t.date);
    const sortKey = t.date.slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, { income: 0, expenses: 0, sortKey });
    }
    const entry = monthMap.get(key)!;
    if (t.direction === "income") {
      entry.income += t.actual_amount;
    } else {
      entry.expenses += t.actual_amount;
    }
  }

  return Array.from(monthMap.entries())
    .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }));
}

function buildPeriodSummary(transactions: Transaction[]): PeriodSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  const monthsSet = new Set<string>();

  for (const t of transactions) {
    if (t.direction === "income") {
      totalIncome += t.actual_amount;
    } else {
      totalExpenses += t.actual_amount;
    }
    if (t.date) {
      monthsSet.add(t.date.slice(0, 7));
    }
  }

  const monthCount = Math.max(monthsSet.size, 1);
  const netSavings = totalIncome - totalExpenses;
  const avgMonthlySavings = netSavings / monthCount;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    avgMonthlySavings,
    savingsRate,
    monthCount,
  };
}

function computePercentChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${Math.round(change)}%`;
}

// ── Component ─────────────────────────────────────────────

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const urlBudgetId = searchParams.get("budget_id");

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetDoc[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(
    urlBudgetId,
  );
  const [userCurrency, setUserCurrency] = useState("USD");
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedReport, setSelectedReport] = useState("category");
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    docId: null,
    status: "idle",
    downloadUrl: null,
    error: null,
  });

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setBudgetDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch budgets + transactions on mount ─────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [txRes, budgetRes, meRes]: any[] = await Promise.all([
        apiService.get("/v1/finance/transactions?limit=200"),
        apiService.get("/v1/finance/budgets?limit=100"),
        apiService.get("/v1/auth/me"),
      ]);

      const txData = txRes?.data || txRes;
      const txItems: Transaction[] = txData?.items || [];
      setAllTransactions(txItems);

      const budgetData = budgetRes?.data || budgetRes;
      const budgetItems: BudgetDoc[] = budgetData?.items || [];
      setBudgets(budgetItems);

      const meData = meRes?.data || meRes;
      if (meData?.preferredCurrency) {
        setUserCurrency(meData.preferredCurrency);
      }

      console.log(
        "[Reports] fetched",
        txItems.length,
        "transactions,",
        budgetItems.length,
        "budgets",
      );
    } catch (error) {
      console.error("[Reports] fetchData error:", error);
      setAllTransactions([]);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Cleanup polling on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Derived data ────────────────────────────────────────
  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId) || null;

  // Currency: prefer the selected budget's currency, fall back to user preference
  const activeCurrency = selectedBudget?.currency || userCurrency;
  const fmt = (amount: number) => formatCurrency(amount, activeCurrency);

  // Get plan row names from the selected budget (for category axis)
  const planRowNames = useMemo(() => {
    if (!selectedBudget) return undefined;
    return Object.values(selectedBudget.groups || {}).flatMap((g) =>
      (g.rows || []).map((r) => r.name).filter(Boolean),
    );
  }, [selectedBudget]);

  // Filter transactions: by budget_id if selected, then by period
  const budgetFilteredTx = selectedBudgetId
    ? allTransactions.filter((t) => t.budget_id === selectedBudgetId)
    : allTransactions;

  const periodConfig =
    PERIOD_OPTIONS.find((p) => p.value === selectedPeriod) || PERIOD_OPTIONS[2];
  const filteredTransactions = filterByPeriod(
    budgetFilteredTx,
    periodConfig.months,
  );
  const previousPeriodTransactions = filterByPeriod(
    budgetFilteredTx,
    periodConfig.months * 2,
  ).filter((t) => !filteredTransactions.includes(t));

  const categoryBreakdown = buildCategoryBreakdown(
    filteredTransactions,
    planRowNames,
  );

  // Detect mixed currencies (only relevant when All Budgets is selected)
  const uniqueCurrencies = useMemo(
    () => [
      ...new Set(filteredTransactions.map((t) => t.currency).filter(Boolean)),
    ],
    [filteredTransactions],
  );
  const hasMixedCurrencies = !selectedBudgetId && uniqueCurrencies.length > 1;
  const currencyGroups = useMemo(
    () =>
      hasMixedCurrencies
        ? buildCategoryBreakdownByCurrency(filteredTransactions)
        : [],
    [hasMixedCurrencies, filteredTransactions],
  );

  const monthlyData = buildMonthlyData(filteredTransactions);
  const summary = buildPeriodSummary(filteredTransactions);
  const previousSummary = buildPeriodSummary(previousPeriodTransactions);

  const totalExpenses = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);
  const maxBarValue = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expenses)),
    1,
  );

  // ── Export handler ──────────────────────────────────────
  const handleExport = async (format: "pdf" | "csv") => {
    if (format === "csv") {
      const rows = filteredTransactions.map((t) => ({
        Date: t.date || "",
        Name: t.name,
        Direction: t.direction,
        Category: t.category || "",
        Amount: t.actual_amount,
        Currency: t.currency,
      }));

      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(","),
        ...rows.map((r) =>
          headers
            .map((h) => `"${(r as Record<string, unknown>)[h]}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "finance-report.csv";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // PDF export via backend
    try {
      setExportStatus({
        docId: null,
        status: "processing",
        downloadUrl: null,
        error: null,
      });

      console.log(
        "[Reports] handleExport → POST /v1/finance/exports/cashflow.pdf",
      );
      const res: any = await apiService.post(
        "/v1/finance/exports/cashflow.pdf",
        {
          title: "Cashflow Report",
          period: `${periodConfig.months}m`,
          currency: activeCurrency,
          include_transactions: true,
          transaction_limit: 200,
        },
      );

      const data = res?.data || res;
      const docId = data?.id;

      if (!docId) {
        setExportStatus({
          docId: null,
          status: "failed",
          downloadUrl: null,
          error: "No document ID returned",
        });
        return;
      }

      console.log("[Reports] export created, docId:", docId, "polling...");
      setExportStatus({
        docId,
        status: "processing",
        downloadUrl: null,
        error: null,
      });

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const pollRes: any = await apiService.get(
            `/v1/finance/docs/${docId}`,
          );
          const pollData = pollRes?.data || pollRes;

          console.log("[Reports] poll ←", pollData?.status);

          if (pollData?.status === "ready") {
            if (pollRef.current) clearInterval(pollRef.current);
            try {
              const dlRes: any = await apiService.get(
                `/v1/documents/${docId}/download`,
              );
              const dlData = dlRes?.data?.data || dlRes?.data || dlRes;
              const downloadUrl = dlData?.download_url || null;
              setExportStatus({
                docId,
                status: "ready",
                downloadUrl,
                error: null,
              });
              if (downloadUrl) {
                window.open(downloadUrl, "_blank");
              }
            } catch (dlErr: any) {
              console.error("[Reports] download endpoint error:", dlErr.message);
              setExportStatus({
                docId,
                status: "ready",
                downloadUrl: null,
                error: "Download link unavailable",
              });
            }
          } else if (pollData?.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setExportStatus({
              docId,
              status: "failed",
              downloadUrl: null,
              error: "Export generation failed",
            });
          }
        } catch (pollError) {
          console.error("[Reports] poll error:", pollError);
        }
      }, 2000);
    } catch (error) {
      console.error("[Reports] handleExport error:", error);
      setExportStatus({
        docId: null,
        status: "failed",
        downloadUrl: null,
        error: "Failed to start export",
      });
    }
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Back + Export Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <Link href="/financial-literacy">
              <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ChevronLeft className="h-4 w-4" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  Finance Literacy / Reports & Exports
                </span>
              </button>
            </Link>

            <div className="flex items-center gap-2">
              {exportStatus.status === "processing" && (
                <span className="flex items-center gap-1 text-sm text-amber-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              )}
              {exportStatus.status === "ready" && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Ready
                </span>
              )}
              {exportStatus.status === "failed" && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  Failed
                </span>
              )}
              <button
                onClick={() => handleExport("pdf")}
                disabled={exportStatus.status === "processing"}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          {/* Filters: Budget + Period */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Budget Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setBudgetDropdownOpen((o) => !o)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedBudgetId
                    ? "bg-[#5A3FFF] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#5A3FFF] hover:text-[#5A3FFF]"
                }`}
              >
                <span className="truncate max-w-[160px]">
                  {selectedBudget
                    ? selectedBudget.title ||
                      selectedBudget.period ||
                      "Untitled Budget"
                    : "All Budgets"}
                </span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>

              {budgetDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 max-h-60 overflow-auto">
                  <button
                    onClick={() => {
                      setSelectedBudgetId(null);
                      setBudgetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      !selectedBudgetId
                        ? "text-[#5A3FFF] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    All Budgets
                  </button>
                  {budgets.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBudgetId(b.id);
                        setBudgetDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        selectedBudgetId === b.id
                          ? "text-[#5A3FFF] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {b.title || b.period || "Untitled Budget"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period Filter */}
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? "bg-[#5A3FFF] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#5A3FFF] hover:text-[#5A3FFF]"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Report Type Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {REPORT_TYPES.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-2xl text-left transition-all ${
                  selectedReport === report.id
                    ? "bg-[#5A3FFF] text-white shadow-lg shadow-[#5A3FFF]/25"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#5A3FFF]"
                }`}
              >
                <report.icon
                  className={`w-5 h-5 mb-2 ${
                    selectedReport === report.id
                      ? "text-white"
                      : "text-[#5A3FFF]"
                  }`}
                />
                <h3 className="text-sm font-semibold">{report.title}</h3>
                <p
                  className={`text-xs mt-1 ${
                    selectedReport === report.id
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  {report.description}
                </p>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin mb-4" />
              <p className="text-gray-500">Loading report data...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
              <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                No transaction data for this period
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Add transactions in the Budget Planner to see reports
              </p>
              <Link href="/financial-literacy/budget-planner">
                <button className="mt-4 px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors">
                  Go to Budget Planner
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* ── Category Breakdown Tab ── */}
              {selectedReport === "category" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Expenses by Category
                    </h2>
                    {!hasMixedCurrencies && (
                      <span className="text-sm text-gray-500">
                        Total: {fmt(totalExpenses)}
                      </span>
                    )}
                  </div>

                  {hasMixedCurrencies ? (
                    <div className="divide-y divide-gray-100">
                      {currencyGroups.map((group) => (
                        <div key={group.currency} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                              {group.currency}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(group.subtotalExpenses, group.currency)}
                            </span>
                          </div>
                          {group.breakdown.filter((c) => c.amount > 0).length === 0 ? (
                            <p className="text-sm text-gray-400">No expenses</p>
                          ) : (
                            <div className="space-y-3">
                              {group.breakdown
                                .filter((c) => c.amount > 0)
                                .map((cat) => (
                                  <div key={cat.category}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-700">
                                        {cat.category}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {formatCurrency(cat.amount, group.currency)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {cat.percentage}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                          width: `${cat.percentage}%`,
                                          backgroundColor: cat.color,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : categoryBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">
                      No expense transactions in this period
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {categoryBreakdown.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">
                              {cat.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {fmt(cat.amount)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {cat.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${cat.percentage}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Monthly Overview Tab ── */}
              {selectedReport === "monthly" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Income vs Expenses
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                        <span className="text-gray-500">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                        <span className="text-gray-500">Expenses</span>
                      </div>
                    </div>
                  </div>

                  {hasMixedCurrencies ? (
                    <p className="text-sm text-gray-400 py-8 text-center">
                      Select a specific budget to view this chart — charts can only display one currency at a time.
                    </p>
                  ) : monthlyData.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">
                      No dated transactions in this period
                    </p>
                  ) : (
                    <>
                      <div className="flex items-end gap-2 h-48">
                        {monthlyData.map((m) => (
                          <div
                            key={m.month}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div className="flex items-end gap-1 w-full h-40">
                              <div
                                className="flex-1 bg-[#10B981] rounded-t-md transition-all"
                                style={{
                                  height: `${(m.income / maxBarValue) * 100}%`,
                                }}
                                title={`Income: ${fmt(m.income)}`}
                              />
                              <div
                                className="flex-1 bg-[#EF4444] rounded-t-md transition-all"
                                style={{
                                  height: `${(m.expenses / maxBarValue) * 100}%`,
                                }}
                                title={`Expenses: ${fmt(m.expenses)}`}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {m.month}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Monthly data table */}
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-4 text-xs font-medium text-gray-500 mb-2 px-1">
                          <span>Month</span>
                          <span className="text-right">Income</span>
                          <span className="text-right">Expenses</span>
                          <span className="text-right">Net</span>
                        </div>
                        {monthlyData.map((m) => {
                          const net = m.income - m.expenses;
                          return (
                            <div
                              key={m.month}
                              className="grid grid-cols-4 text-sm py-1.5 px-1 border-b border-gray-50 last:border-0"
                            >
                              <span className="text-gray-700">{m.month}</span>
                              <span className="text-right text-green-600">
                                {fmt(m.income)}
                              </span>
                              <span className="text-right text-red-600">
                                {fmt(m.expenses)}
                              </span>
                              <span
                                className={`text-right font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {fmt(net)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Trends Tab ── */}
              {selectedReport === "trends" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Spending Trends
                    </h2>
                    <span className="text-sm text-gray-500">
                      {periodConfig.label}
                    </span>
                  </div>

                  {hasMixedCurrencies ? (
                    <p className="text-sm text-gray-400 py-8 text-center">
                      Select a specific budget to view this chart — charts can only display one currency at a time.
                    </p>
                  ) : monthlyData.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">
                      No dated transactions in this period
                    </p>
                  ) : (
                    <>
                      {/* Expense trend line chart (CSS-based) */}
                      <div className="relative h-48 flex items-end gap-1 mb-4">
                        {(() => {
                          const maxExp = Math.max(
                            ...monthlyData.map((m) => m.expenses),
                            1,
                          );
                          return monthlyData.map((m, i) => (
                            <div
                              key={m.month}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div className="w-full flex flex-col items-center h-40 justify-end">
                                <div
                                  className="w-full max-w-[40px] bg-gradient-to-t from-[#5A3FFF] to-[#8B7AFF] rounded-t-md transition-all relative group"
                                  style={{
                                    height: `${(m.expenses / maxExp) * 100}%`,
                                    minHeight: m.expenses > 0 ? "4px" : "0px",
                                  }}
                                >
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {fmt(m.expenses)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-500">
                                {m.month}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Top spending categories for this period */}
                      <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Top Spending Categories
                        </h3>
                        <div className="space-y-2">
                          {categoryBreakdown.slice(0, 5).map((cat, i) => (
                            <div
                              key={cat.category}
                              className="flex items-center gap-3"
                            >
                              <span className="text-xs text-gray-400 w-4">
                                {i + 1}.
                              </span>
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-sm text-gray-700 flex-1">
                                {cat.category}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {fmt(cat.amount)}
                              </span>
                              <span className="text-xs text-gray-500 w-10 text-right">
                                {cat.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Average monthly spend */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Avg. monthly spending
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {fmt(
                              summary.totalExpenses /
                                Math.max(monthlyData.length, 1),
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Period Comparison Tab ── */}
              {selectedReport === "comparison" && (
                <div className="space-y-6">
                  {hasMixedCurrencies ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                      <p className="text-sm text-gray-400">
                        Select a specific budget to view this report — period comparison requires a single currency.
                      </p>
                    </div>
                  ) : (
                  <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <span className="text-sm text-gray-500">
                        Total Income
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {fmt(summary.totalIncome)}
                      </p>
                      <span className="text-xs text-green-600">
                        {computePercentChange(
                          summary.totalIncome,
                          previousSummary.totalIncome,
                        )}{" "}
                        from last period
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <span className="text-sm text-gray-500">
                        Total Expenses
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {fmt(summary.totalExpenses)}
                      </p>
                      <span className="text-xs text-red-600">
                        {computePercentChange(
                          summary.totalExpenses,
                          previousSummary.totalExpenses,
                        )}{" "}
                        from last period
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <span className="text-sm text-gray-500">Net Savings</span>
                      <p
                        className={`text-2xl font-bold mt-1 ${summary.netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {fmt(summary.netSavings)}
                      </p>
                      <span className="text-xs text-green-600">
                        {computePercentChange(
                          summary.netSavings,
                          previousSummary.netSavings,
                        )}{" "}
                        from last period
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <span className="text-sm text-gray-500">
                        Savings Rate
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {Math.round(summary.savingsRate)}%
                      </p>
                      <span className="text-xs text-gray-500">
                        Avg. {fmt(summary.avgMonthlySavings)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Current vs Previous Period
                    </h2>

                    <div className="space-y-4">
                      {/* Income comparison */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">Income</span>
                          <span className="text-xs text-gray-500">
                            {computePercentChange(
                              summary.totalIncome,
                              previousSummary.totalIncome,
                            )}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div
                                className="h-3 rounded-full bg-[#10B981] transition-all"
                                style={{
                                  width: `${Math.min(100, (summary.totalIncome / Math.max(summary.totalIncome, previousSummary.totalIncome, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Current: {fmt(summary.totalIncome)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div
                                className="h-3 rounded-full bg-[#10B981]/40 transition-all"
                                style={{
                                  width: `${Math.min(100, (previousSummary.totalIncome / Math.max(summary.totalIncome, previousSummary.totalIncome, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Previous:{" "}
                              {fmt(previousSummary.totalIncome)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses comparison */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">
                            Expenses
                          </span>
                          <span className="text-xs text-gray-500">
                            {computePercentChange(
                              summary.totalExpenses,
                              previousSummary.totalExpenses,
                            )}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div
                                className="h-3 rounded-full bg-[#EF4444] transition-all"
                                style={{
                                  width: `${Math.min(100, (summary.totalExpenses / Math.max(summary.totalExpenses, previousSummary.totalExpenses, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Current: {fmt(summary.totalExpenses)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div
                                className="h-3 rounded-full bg-[#EF4444]/40 transition-all"
                                style={{
                                  width: `${Math.min(100, (previousSummary.totalExpenses / Math.max(summary.totalExpenses, previousSummary.totalExpenses, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5">
                              Previous:{" "}
                              {fmt(previousSummary.totalExpenses)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Net Savings comparison */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">
                            Net Savings
                          </span>
                          <span className="text-xs text-gray-500">
                            {computePercentChange(
                              summary.netSavings,
                              previousSummary.netSavings,
                            )}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 p-3 bg-gray-50 rounded-xl text-center">
                            <p
                              className={`text-lg font-bold ${summary.netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {fmt(summary.netSavings)}
                            </p>
                            <span className="text-xs text-gray-500">
                              Current
                            </span>
                          </div>
                          <div className="flex-1 p-3 bg-gray-50 rounded-xl text-center">
                            <p
                              className={`text-lg font-bold ${previousSummary.netSavings >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {fmt(previousSummary.netSavings)}
                            </p>
                            <span className="text-xs text-gray-500">
                              Previous
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex flex-col h-full bg-white" />}>
      <ReportsPageContent />
    </Suspense>
  );
}
