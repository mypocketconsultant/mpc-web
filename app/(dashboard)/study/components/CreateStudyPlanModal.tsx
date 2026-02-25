"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, BookOpen, Sparkles } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

export interface NewStudyPlan {
  class_id: string;
  prompt: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  sessions_per_week: number;
  minutes_per_session: number;
}

interface StudyClass {
  id: string;
  title: string;
  subject?: string;
}

interface CreateStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: NewStudyPlan) => void;
}

export default function CreateStudyPlanModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStudyPlanModalProps) {
  const [formData, setFormData] = useState<NewStudyPlan>({
    class_id: "",
    prompt: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    sessions_per_week: 3,
    minutes_per_session: 45,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch user's classes when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingClasses(true);
      apiService
        .get("/v1/study/classes")
        .then((res: any) => {
          const data = res?.data || res || [];
          setClasses(Array.isArray(data) ? data : []);
        })
        .catch((err: any) => {
          console.error("Failed to fetch classes:", err);
          setClasses([]);
        })
        .finally(() => setLoadingClasses(false));
    }
  }, [isOpen]);

  const sessionsOptions = [1, 2, 3, 4, 5, 6, 7];
  const minutesOptions = [15, 30, 45, 60, 90, 120];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sessions_per_week" || name === "minutes_per_session"
          ? parseInt(value, 10)
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.class_id) {
      newErrors.class_id = "Please select a class";
    }
    if (!formData.prompt.trim() || formData.prompt.trim().length < 3) {
      newErrors.prompt = "Please describe what you want to study (at least 3 characters)";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        class_id: "",
        prompt: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        sessions_per_week: 3,
        minutes_per_session: 45,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create AI Study Plan
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Class Selection */}
          <div>
            <label
              htmlFor="class_id"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              <BookOpen className="w-4 h-4 inline-block mr-1" />
              Class *
            </label>
            {loadingClasses ? (
              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400">
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="w-full px-4 py-3 rounded-xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-700">
                No classes found. Please create a class first.
              </div>
            ) : (
              <select
                id="class_id"
                name="class_id"
                value={formData.class_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.class_id ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white`}
              >
                <option value="">Select a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                    {cls.subject ? ` (${cls.subject})` : ""}
                  </option>
                ))}
              </select>
            )}
            {errors.class_id && (
              <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
            )}
          </div>

          {/* AI Prompt */}
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              What do you want to study? *
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="e.g., Create a plan to study Biology Chapter 5-10 for my upcoming exam"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.prompt ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none`}
            />
            {errors.prompt && (
              <p className="text-red-500 text-xs mt-1">{errors.prompt}</p>
            )}
          </div>

          {/* Title (optional) */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Plan Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Biology Exam Prep (auto-generated if blank)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.start_date ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.start_date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.end_date ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Sessions per Week + Minutes per Session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sessions_per_week"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Sessions / Week
              </label>
              <select
                id="sessions_per_week"
                name="sessions_per_week"
                value={formData.sessions_per_week}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white"
              >
                {sessionsOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "session" : "sessions"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="minutes_per_session"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Minutes / Session
              </label>
              <select
                id="minutes_per_session"
                name="minutes_per_session"
                value={formData.minutes_per_session}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white"
              >
                {minutesOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any additional notes about this plan..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={classes.length === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white font-medium text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
