"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  FileText,
  PieChart,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import Header from "@/app/components/header";

interface ReportData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

const expensesByCategory: ReportData[] = [
  { category: "Rent", amount: 1500, percentage: 40, color: "#5A3FFF" },
  { category: "Groceries", amount: 450, percentage: 12, color: "#10B981" },
  { category: "Utilities", amount: 200, percentage: 5, color: "#F59E0B" },
  { category: "Transportation", amount: 300, percentage: 8, color: "#EC4899" },
  { category: "Entertainment", amount: 150, percentage: 4, color: "#8B5CF6" },
  { category: "Healthcare", amount: 100, percentage: 3, color: "#06B6D4" },
  { category: "Shopping", amount: 400, percentage: 11, color: "#EF4444" },
  { category: "Other", amount: 650, percentage: 17, color: "#6B7280" },
];

const monthlyData: MonthlyData[] = [
  { month: "Jul", income: 5200, expenses: 3200 },
  { month: "Aug", income: 5500, expenses: 3400 },
  { month: "Sep", income: 5300, expenses: 3100 },
  { month: "Oct", income: 5800, expenses: 3600 },
  { month: "Nov", income: 5400, expenses: 3300 },
  { month: "Dec", income: 6200, expenses: 4100 },
];

const reportTypes = [
  {
    id: "monthly",
    title: "Monthly Summary",
    description: "Overview of income and expenses for the month",
    icon: Calendar,
  },
  {
    id: "category",
    title: "Category Breakdown",
    description: "Detailed breakdown by spending category",
    icon: PieChart,
  },
  {
    id: "trends",
    title: "Spending Trends",
    description: "Track your spending patterns over time",
    icon: TrendingUp,
  },
  {
    id: "comparison",
    title: "Income vs Expenses",
    description: "Compare your income against expenses",
    icon: BarChart3,
  },
];

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedReport, setSelectedReport] = useState("category");

  const totalExpenses = expensesByCategory.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    // Simulate export functionality
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const maxBarValue = Math.max(
    ...monthlyData.flatMap((d) => [d.income, d.expenses])
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/financial-literacy">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Finance Literacy / Reports & Exports</span>
            </button>
          </Link>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Financial Reports
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Analyze your finances and export detailed reports
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Period:</span>
            </div>
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              {[
                { id: "1month", label: "1 Month" },
                { id: "3months", label: "3 Months" },
                { id: "6months", label: "6 Months" },
                { id: "1year", label: "1 Year" },
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.id
                      ? "bg-[#5A3FFF] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedReport === report.id
                      ? "bg-[#5A3FFF] text-white border-[#5A3FFF] shadow-lg"
                      : "bg-white border-gray-100 hover:border-[#5A3FFF] hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      selectedReport === report.id
                        ? "bg-white/20"
                        : "bg-[#F3F0FF]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        selectedReport === report.id
                          ? "text-white"
                          : "text-[#5A3FFF]"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                  <p
                    className={`text-xs ${
                      selectedReport === report.id
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}
                  >
                    {report.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Report Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Expenses by Category
                </h2>
                <span className="text-sm text-gray-500">
                  Total: {formatCurrency(totalExpenses)}
                </span>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {expensesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Income vs Expenses
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-xs text-gray-500">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="text-xs text-gray-500">Expenses</span>
                  </div>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-48">
                {monthlyData.map((data) => (
                  <div
                    key={data.month}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="flex gap-1 items-end h-40 w-full">
                      {/* Income Bar */}
                      <div
                        className="flex-1 bg-[#10B981] rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${(data.income / maxBarValue) * 100}%`,
                        }}
                      />
                      {/* Expense Bar */}
                      <div
                        className="flex-1 bg-[#EF4444] rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${(data.expenses / maxBarValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Period Summary
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(33400)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    +12% from last period
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(20700)}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    +8% from last period
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Net Savings</p>
                  <p className="text-2xl font-bold text-[#5A3FFF]">
                    {formatCurrency(12700)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    +18% from last period
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg. Monthly Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(2117)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    38% savings rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
