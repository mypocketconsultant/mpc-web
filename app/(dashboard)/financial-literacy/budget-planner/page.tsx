"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Edit2,
  Trash2,
  PieChart,
} from "lucide-react";
import Header from "@/app/components/header";

interface BudgetEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: Date;
  recurring: boolean;
}

interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

const sampleEntries: BudgetEntry[] = [
  {
    id: "1",
    type: "income",
    category: "Salary",
    description: "Monthly salary",
    amount: 5000,
    date: new Date(2025, 0, 1),
    recurring: true,
  },
  {
    id: "2",
    type: "expense",
    category: "Rent",
    description: "Monthly rent payment",
    amount: 1500,
    date: new Date(2025, 0, 1),
    recurring: true,
  },
  {
    id: "3",
    type: "expense",
    category: "Groceries",
    description: "Weekly groceries",
    amount: 150,
    date: new Date(2025, 0, 5),
    recurring: false,
  },
  {
    id: "4",
    type: "expense",
    category: "Utilities",
    description: "Electric and water bills",
    amount: 200,
    date: new Date(2025, 0, 10),
    recurring: true,
  },
  {
    id: "5",
    type: "income",
    category: "Freelance",
    description: "Side project payment",
    amount: 800,
    date: new Date(2025, 0, 15),
    recurring: false,
  },
  {
    id: "6",
    type: "expense",
    category: "Entertainment",
    description: "Streaming subscriptions",
    amount: 50,
    date: new Date(2025, 0, 1),
    recurring: true,
  },
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Business",
  "Other Income",
];
const expenseCategories = [
  "Rent",
  "Groceries",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Other Expenses",
];

export default function BudgetPlannerPage() {
  const [entries, setEntries] = useState<BudgetEntry[]>(sampleEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">(
    "all",
  );

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  // Calculate summary
  const summary: BudgetSummary = entries.reduce(
    (acc, entry) => {
      if (entry.type === "income") {
        acc.totalIncome += entry.amount;
      } else {
        acc.totalExpenses += entry.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpenses;
      acc.savingsRate =
        acc.totalIncome > 0
          ? ((acc.totalIncome - acc.totalExpenses) / acc.totalIncome) * 100
          : 0;
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0 },
  );

  const filteredEntries = entries.filter((entry) => {
    if (activeTab === "all") return true;
    return entry.type === activeTab;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entryId = editingEntry?.id || crypto.randomUUID();
    const newEntry: BudgetEntry = {
      id: entryId,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      recurring: formData.recurring,
    };

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editingEntry.id ? newEntry : e)),
      );
    } else {
      setEntries((prev) => [...prev, newEntry]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      recurring: false,
    });
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const handleEdit = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date.toISOString().split("T")[0],
      recurring: entry.recurring,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/financial-literacy">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Finance Literacy / Budget Planner</span>
            </button>
          </Link>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Income */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Total Income</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Balance</span>
              </div>
              <p
                className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(summary.balance)}
              </p>
            </div>

            {/* Savings Rate */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Savings Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Entries Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-gray-100 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Budget Entries
                </h2>
                <p className="text-sm text-gray-500">
                  Track your income and expenses
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Entry
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

            {/* Entries List */}
            <div className="divide-y divide-gray-100">
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No entries yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add your first entry to start tracking
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          entry.type === "income"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {entry.type === "income" ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {entry.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.date)}
                          </span>
                          {entry.recurring && (
                            <span className="text-[#5A3FFF] text-xs">
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p
                        className={`font-semibold ${
                          entry.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {entry.type === "income" ? "+" : "-"}
                        {formatCurrency(entry.amount)}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetForm}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "income", category: "" })
                  }
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.type === "income"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "expense", category: "" })
                  }
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.type === "expense"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white"
                >
                  <option value="">Select a category</option>
                  {(formData.type === "income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Enter description"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) =>
                    setFormData({ ...formData, recurring: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#5A3FFF] focus:ring-[#5A3FFF]"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  This is a recurring entry
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white font-medium text-sm hover:shadow-lg transition-all"
                >
                  {editingEntry ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
