"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, BookOpen } from "lucide-react";

export interface NewStudyPlan {
  title: string;
  subject: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  priority: "low" | "medium" | "high";
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
    title: "",
    subject: "",
    description: "",
    date: "",
    time: "",
    duration: "1 hour",
    priority: "medium",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const durations = [
    "30 minutes",
    "1 hour",
    "1.5 hours",
    "2 hours",
    "2.5 hours",
    "3 hours",
    "4 hours",
  ];

  const priorities: { value: "low" | "medium" | "high"; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-700 border-green-300" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { value: "high", label: "High", color: "bg-red-100 text-red-700 border-red-300" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        subject: "",
        description: "",
        date: "",
        time: "",
        duration: "1 hour",
        priority: "medium",
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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Study Plan
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
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Plan Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Study Biology Chapter 5"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.title ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Biology, Mathematics, English"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.subject ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
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
              placeholder="Add notes or details about this study session..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.date ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Clock className="w-4 h-4 inline-block mr-1" />
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.time ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.time && (
                <p className="text-red-500 text-xs mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white"
            >
              {durations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority: priority.value }))
                  }
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    formData.priority === priority.value
                      ? priority.color + " ring-2 ring-offset-1"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
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
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white font-medium text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
