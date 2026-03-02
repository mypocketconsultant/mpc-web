"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  Loader2,
  ArrowRight,
  Plus,
  X,
  Trash2,
  Check,
  BarChart3,
} from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { apiService } from "@/lib/api/apiService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BudgetRow {
  name: string;
  target_amount: number;
}

interface BudgetGroup {
  rows: BudgetRow[];
}

interface BudgetDoc {
  id: string;
  title: string | null;
  period: string;
  currency: string;
  status: "draft" | "published";
  groups: Record<string, BudgetGroup>;
  created_at: string;
}

interface Transaction {
  id: string;
  budget_id: string | null;
  name: string;
  direction: "income" | "expense";
  category: string | null;
  target_amount: number | null;
  actual_amount: number;
  currency: string;
  date: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/*  New Budget Modal                                                   */
/* ------------------------------------------------------------------ */

function NewBudgetModal({
  onClose,
  onCreated,
  defaultCurrency,
}: {
  onClose: () => void;
  onCreated: (b: BudgetDoc) => void;
  defaultCurrency?: string;
}) {
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!period) {
      setError("Period is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res: any = await apiService.post("/v1/finance/budgets", {
        title: title.trim() || undefined,
        period,
        currency,
      });
      const data = res?.data || res;
      onCreated(data);
    } catch (e: any) {
      setError(e?.message || "Failed to create budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">New Budget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Title (optional)
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              placeholder="e.g. March Budget, Brazil Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Period
            </label>
            <input
              type="month"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Currency
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors bg-white"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
              <option value="CAD">CAD — Canadian Dollar</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 bg-[#5A3FFF] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#4930e8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Create Budget
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Transaction Modal                                              */
/* ------------------------------------------------------------------ */

function AddTransactionModal({
  budget,
  onClose,
  onAdded,
}: {
  budget: BudgetDoc;
  onClose: () => void;
  onAdded: (tx: Transaction) => void;
}) {
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(budget.period ? `${budget.period}-01` : "");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flatten all row names from all groups as category options
  const categoryOptions = Object.values(budget.groups || {}).flatMap((group) =>
    (group.rows || []).map((r) => r.name).filter(Boolean),
  );

  const submit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res: any = await apiService.post("/v1/finance/transactions", {
        name: name.trim(),
        direction,
        actual_amount: amt,
        currency: budget.currency,
        date: date || undefined,
        category: category || undefined,
        budget_id: budget.id,
      });
      const data = res?.data || res;
      onAdded(data);
    } catch (e: any) {
      setError(e?.message || "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6 mb-4 sm:mb-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Income / Expense toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["expense", "income"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  direction === d
                    ? d === "income"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {d === "income" ? "Income" : "Expense"}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Name
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              placeholder="e.g. Salary, Rent, Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Amount ({budget.currency})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {categoryOptions.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Category
              </label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 bg-[#5A3FFF] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#4930e8] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan Row Editor (inline, per group)                               */
/* ------------------------------------------------------------------ */

function PlanGroupEditor({
  groupName,
  rows,
  currency,
  onSave,
}: {
  groupName: string;
  rows: BudgetRow[];
  currency: string;
  onSave: (updated: BudgetRow[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [localRows, setLocalRows] = useState<BudgetRow[]>(rows);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Sync localRows when the rows prop is updated from outside (e.g. after API refresh)
  useEffect(() => {
    if (!editing) {
      setLocalRows(rows);
    }
  }, [rows, editing]);

  const addRow = () => {
    const amt = parseFloat(newAmount);
    if (!newName.trim() || isNaN(amt) || amt < 0) return;
    setLocalRows((r) => [...r, { name: newName.trim(), target_amount: amt }]);
    setNewName("");
    setNewAmount("");
  };

  const removeRow = (i: number) =>
    setLocalRows((r) => r.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      let rowsToSave = localRows;
      const amt = parseFloat(newAmount);
      if (newName.trim() && !isNaN(amt) && amt >= 0) {
        rowsToSave = [...localRows, { name: newName.trim(), target_amount: amt }];
      }
      await onSave(rowsToSave);
      setNewName("");
      setNewAmount("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setLocalRows(rows);
    setNewName("");
    setNewAmount("");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-50 last:border-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {groupName}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[#5A3FFF] hover:underline"
          >
            Edit
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No rows yet</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{row.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {fmt(row.target_amount || 0, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-50 last:border-0 bg-purple-50/30">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {groupName}
      </p>

      {/* Existing rows */}
      <div className="space-y-2 mb-3">
        {localRows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-700 flex-1">{row.name}</span>
            <span className="text-sm font-medium text-gray-900">
              {fmt(row.target_amount || 0, currency)}
            </span>
            <button
              onClick={() => removeRow(i)}
              className="text-red-400 hover:text-red-600 ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {localRows.length === 0 && (
          <p className="text-xs text-gray-400 italic">No rows yet</p>
        )}
      </div>

      {/* Add new row inline */}
      <div className="flex items-center gap-2 mb-4">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#5A3FFF]"
          placeholder="Row name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRow()}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#5A3FFF]"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRow()}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={cancel}
          className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 bg-[#5A3FFF] text-white rounded-lg py-1.5 text-xs font-medium hover:bg-[#4930e8] disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Save
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Budget Chart (Planned vs Actual per group)                        */
/* ------------------------------------------------------------------ */

const CURRENCY_COMPACT = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
};

function BudgetChart({
  budget,
  transactions,
}: {
  budget: BudgetDoc;
  transactions: Transaction[];
}) {
  // Build actual totals keyed by transaction category (case-insensitive)
  const actualByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    const key = (tx.category || "").toLowerCase().trim();
    if (key)
      actualByCategory[key] =
        (actualByCategory[key] || 0) + (tx.actual_amount || 0);
  }

  // Flatten all rows from all groups — each row becomes one bar pair
  const chartData: { item: string; planned: number; actual: number }[] = [];
  for (const group of Object.values(budget.groups || {})) {
    for (const row of group.rows || []) {
      const key = (row.name || "").toLowerCase().trim();
      chartData.push({
        item: row.name,
        planned: row.target_amount || 0,
        actual: actualByCategory[key] || 0,
      });
    }
  }

  // Show empty state if no data
  const hasData = chartData.some((d) => d.planned > 0 || d.actual > 0);
  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Planned vs actual per line item</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-400">Add items to your plan to see the overview chart.</p>
        </div>
      </div>
    );
  }

  // Compute Y-axis label width based on longest row name
  const maxLabelLen = Math.max(...chartData.map((d) => d.item.length), 4);
  const yAxisWidth = Math.min(Math.max(maxLabelLen * 7, 80), 180);

  const chartHeight = Math.max(200, chartData.length * 52);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: p.color }}
            />
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-medium text-gray-900">
              {fmt(p.value, budget.currency)}
            </span>
          </div>
        ))}
        {payload.length === 2 && payload[0].value > 0 && (
          <p
            className={`mt-1.5 font-medium ${
              payload[1].value > payload[0].value
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {payload[1].value > payload[0].value
              ? `Over by ${fmt(payload[1].value - payload[0].value, budget.currency)}`
              : `Under by ${fmt(payload[0].value - payload[1].value, budget.currency)}`}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Planned vs actual per line item
        </p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f0f0f0"
            />
            <XAxis
              type="number"
              tickFormatter={CURRENCY_COMPACT}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="item"
              width={yAxisWidth}
              tick={{ fontSize: 12, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar
              dataKey="planned"
              name="Planned"
              fill="#e9d5ff"
              radius={[0, 4, 4, 0]}
            />
            <Bar dataKey="actual" name="Actual" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => {
                const over = entry.actual > entry.planned && entry.planned > 0;
                return <Cell key={i} fill={over ? "#f87171" : "#818cf8"} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function BudgetPlannerPage() {
  // Level 1 — list of budgets
  const [budgets, setBudgets] = useState<BudgetDoc[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [showNewBudget, setShowNewBudget] = useState(false);

  // User currency preference
  const [userCurrency, setUserCurrency] = useState("USD");

  // Level 2 — selected budget + its transactions
  const [selectedBudget, setSelectedBudget] = useState<BudgetDoc | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [showAddTx, setShowAddTx] = useState(false);
  const [publishing, setPublishing] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Fetch user currency preference on mount                         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    async function fetchUserCurrency() {
      try {
        const res: any = await apiService.get("/v1/auth/me");
        const data = res?.data?.data || res?.data || res;
        const pref = data?.user?.preferredCurrency;
        if (pref) setUserCurrency(pref);
      } catch (err) {
        console.error("[BudgetPlanner] Failed to fetch user currency preference", err);
      }
    }
    fetchUserCurrency();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Level 1 — fetch budget list                                     */
  /* ---------------------------------------------------------------- */

  const fetchBudgets = useCallback(async () => {
    setLoadingBudgets(true);
    try {
      const res: any = await apiService.get("/v1/finance/budgets");
      const data = res?.data || res;
      setBudgets(data?.items || []);
    } catch (err) {
      console.error("[BudgetPlanner] fetchBudgets error", err);
    } finally {
      setLoadingBudgets(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  /* ---------------------------------------------------------------- */
  /*  Level 2 — fetch transactions for selected budget               */
  /* ---------------------------------------------------------------- */

  const openBudget = useCallback(async (budget: BudgetDoc) => {
    setSelectedBudget(budget);
    setActiveTab("all");
    setLoadingTx(true);
    try {
      const res: any = await apiService.get(
        `/v1/finance/transactions?budget_id=${budget.id}&limit=200`,
      );
      const data = res?.data || res;
      setTransactions(data?.items || []);
    } catch (err) {
      console.error("[BudgetPlanner] openBudget transactions error", err);
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Refresh selected budget + transactions from API                 */
  /* ---------------------------------------------------------------- */

  const refreshBudget = useCallback(
    async (budgetId: string) => {
      try {
        // Re-fetch the budget document
        const budgetRes: any = await apiService.get(
          `/v1/finance/budgets/${budgetId}`,
        );
        const updatedBudget: BudgetDoc = budgetRes?.data || budgetRes;
        setSelectedBudget(updatedBudget);
        setBudgets((prev) =>
          prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)),
        );
      } catch (err) {
        console.error("[BudgetPlanner] refreshBudget error", err);
      }

      try {
        // Re-fetch transactions
        const txRes: any = await apiService.get(
          `/v1/finance/transactions?budget_id=${budgetId}&limit=200`,
        );
        const txData = txRes?.data || txRes;
        setTransactions(txData?.items || []);
      } catch (err) {
        console.error("[BudgetPlanner] refreshBudget transactions error", err);
      }
    },
    [],
  );

  /* ---------------------------------------------------------------- */
  /*  Plan row save (PATCH budget groups)                             */
  /* ---------------------------------------------------------------- */

  const savePlanGroup = useCallback(
    async (groupName: string, updatedRows: BudgetRow[]) => {
      if (!selectedBudget) return;

      // Detect removed rows so we can cascade-delete their transactions
      const oldRows: BudgetRow[] =
        selectedBudget.groups?.[groupName]?.rows || [];
      const newRowNames = new Set(
        updatedRows.map((r) => r.name?.toLowerCase()),
      );
      const removedRows = oldRows.filter(
        (r) => r.name && !newRowNames.has(r.name.toLowerCase()),
      );

      // Cascade-delete transactions for each removed row
      if (removedRows.length > 0) {
        await Promise.allSettled(
          removedRows.map((r) =>
            apiService.delete(
              `/v1/finance/transactions?budget_id=${selectedBudget.id}&category=${encodeURIComponent(r.name)}`,
            ),
          ),
        );
      }

      const updatedGroups = {
        ...selectedBudget.groups,
        [groupName]: { rows: updatedRows },
      };
      await apiService.patch(
        `/v1/finance/budgets/${selectedBudget.id}`,
        { groups: updatedGroups },
      );

      // Re-fetch fresh budget + transactions from API
      await refreshBudget(selectedBudget.id);
    },
    [selectedBudget, refreshBudget],
  );

  /* ---------------------------------------------------------------- */
  /*  Publish budget                                                   */
  /* ---------------------------------------------------------------- */

  const publishBudget = useCallback(async () => {
    if (!selectedBudget || selectedBudget.status === "published") return;
    setPublishing(true);
    try {
      await apiService.patch(
        `/v1/finance/budgets/${selectedBudget.id}`,
        { status: "published" },
      );
      // Re-fetch fresh budget from API
      await refreshBudget(selectedBudget.id);
    } catch (err) {
      console.error("[BudgetPlanner] publishBudget error", err);
    } finally {
      setPublishing(false);
    }
  }, [selectedBudget, refreshBudget]);

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  const filteredTx = transactions.filter((t) =>
    activeTab === "all" ? true : t.direction === activeTab,
  );

  const totalPlanned = (budget: BudgetDoc) =>
    Object.values(budget.groups || {}).reduce(
      (sum, g) =>
        sum + (g.rows || []).reduce((s, r) => s + (r.target_amount || 0), 0),
      0,
    );

  const budgetLabel = (b: BudgetDoc) =>
    b.title || b.period || "Untitled Budget";

  /* ---------------------------------------------------------------- */
  /*  Render — Level 1 (budget list)                                  */
  /* ---------------------------------------------------------------- */

  if (!selectedBudget) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header title="Finance Literacy" />

        {showNewBudget && (
          <NewBudgetModal
            onClose={() => setShowNewBudget(false)}
            onCreated={(b) => {
              setBudgets((prev) => [b, ...prev]);
              setShowNewBudget(false);
              openBudget(b);
            }}
            defaultCurrency={userCurrency}
          />
        )}

        <main className="flex-1 overflow-auto pb-28">
          <div className="max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <Link href="/financial-literacy">
              <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 sm:mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Finance Literacy / Budget Planner
              </button>
            </Link>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Your Budgets
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-[200px] sm:max-w-none">
                  Tap a budget to see its plan and transactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={userCurrency}
                  onChange={async (e) => {
                    const newCurrency = e.target.value;
                    setUserCurrency(newCurrency);
                    try {
                      await apiService.patch("/v1/auth/me", { preferredCurrency: newCurrency });
                    } catch (err) {
                      console.error("[BudgetPlanner] Failed to save currency preference", err);
                    }
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 bg-white focus:border-[#5A3FFF] outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="CAD">CAD</option>
                </select>
                <button
                  onClick={() => setShowNewBudget(true)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#5A3FFF] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-[#4930e8] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Budget
                </button>
              </div>
            </div>

            {loadingBudgets ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin" />
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No budgets yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create one manually or ask the AI in chat.
                </p>
                <button
                  onClick={() => setShowNewBudget(true)}
                  className="mt-4 flex items-center gap-2 bg-[#5A3FFF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4930e8] transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  New Budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgets.map((budget) => {
                  const groupNames = Object.keys(budget.groups || {});
                  return (
                    <button
                      key={budget.id}
                      onClick={() => openBudget(budget)}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 text-left hover:border-[#5A3FFF] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center">
                            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">
                              {budgetLabel(budget)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {budget.period} · {budget.currency}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              budget.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {budget.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#5A3FFF] transition-colors" />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {groupNames.map((g) => (
                          <span
                            key={g}
                            className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600"
                          >
                            {g} ({(budget.groups[g]?.rows || []).length})
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        Planned total:{" "}
                        {fmt(totalPlanned(budget), budget.currency)}
                        {" · "}
                        {budget.created_at
                          ? new Date(budget.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <InputFooter
          placeholder="Ask the AI about your budget..."
          onSend={() => {}}
          onAttach={() => {}}
          context="financial-literacy"
        />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render — Level 2 (budget detail: plan vs actual)                */
  /* ---------------------------------------------------------------- */

  const totalIncome = transactions
    .filter((t) => t.direction === "income")
    .reduce((s, t) => s + t.actual_amount, 0);

  const totalExpense = transactions
    .filter((t) => t.direction === "expense")
    .reduce((s, t) => s + t.actual_amount, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      {showAddTx && (
        <AddTransactionModal
          budget={selectedBudget}
          onClose={() => setShowAddTx(false)}
          onAdded={() => {
            setShowAddTx(false);
            refreshBudget(selectedBudget.id);
          }}
        />
      )}

      <main className="flex-1 overflow-auto pb-28">
        <div className="max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Back */}
          <button
            onClick={() => setSelectedBudget(null)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 sm:mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Budgets
          </button>

          {/* Budget header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 max-w-[150px] sm:max-w-[300px]">
                {budgetLabel(selectedBudget)}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedBudget.period} · {selectedBudget.currency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/financial-literacy/reports?budget_id=${selectedBudget.id}`}
              >
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5A3FFF] bg-[#5A3FFF]/10 rounded-full hover:bg-[#5A3FFF]/20 transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Report
                </button>
              </Link>
              {selectedBudget.status === "draft" && (
                <button
                  onClick={publishBudget}
                  disabled={publishing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {publishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Publish
                </button>
              )}
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedBudget.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedBudget.status}
              </span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Planned</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {fmt(totalPlanned(selectedBudget), selectedBudget.currency)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Actual Income</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {fmt(totalIncome, selectedBudget.currency)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Actual Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {fmt(totalExpense, selectedBudget.currency)}
              </p>
            </div>
          </div>

          {/* Overview chart */}
          {!loadingTx && (
            <BudgetChart budget={selectedBudget} transactions={transactions} />
          )}

          {/* Plan — budget groups with inline editing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Plan</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Your intended income and spending for this period
              </p>
            </div>

            {Object.entries(selectedBudget.groups || {}).length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No groups yet — edit the plan to add rows.
              </div>
            ) : (
              Object.entries(selectedBudget.groups || {}).map(
                ([groupName, group]) => (
                  <PlanGroupEditor
                    key={groupName}
                    groupName={groupName}
                    rows={group.rows || []}
                    currency={selectedBudget.currency}
                    onSave={(updatedRows) =>
                      savePlanGroup(groupName, updatedRows)
                    }
                  />
                ),
              )
            )}
          </div>

          {/* Actual transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Actual Transactions
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Real income and spending recorded against this budget
                </p>
              </div>
              <button
                onClick={() => setShowAddTx(true)}
                className="flex items-center gap-1.5 bg-[#5A3FFF] text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-[#4930e8] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["all", "income", "expense"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-[#5A3FFF] border-b-2 border-[#5A3FFF]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab === "income"
                      ? "Income"
                      : "Expenses"}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {loadingTx ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-7 h-7 text-[#5A3FFF] animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Loading transactions...
                  </p>
                </div>
              ) : filteredTx.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                  <button
                    onClick={() => setShowAddTx(true)}
                    className="mt-3 flex items-center gap-1.5 bg-[#5A3FFF] text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-[#4930e8] transition-colors mx-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Transaction
                  </button>
                </div>
              ) : (
                filteredTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.direction === "income"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {tx.direction === "income" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {tx.category && (
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded-full">
                              {tx.category}
                            </span>
                          )}
                          {tx.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tx.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          tx.direction === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.direction === "income" ? "+" : "-"}
                        {fmt(tx.actual_amount, tx.currency)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <InputFooter
        placeholder="Ask the AI about your budget..."
        onSend={() => {}}
        onAttach={() => {}}
        context="financial-literacy"
      />
    </div>
  );
}
