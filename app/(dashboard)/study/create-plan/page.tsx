"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  Calendar,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Header from "@/app/components/header";

interface StudyPlanFormData {
  title: string;
  subject: string;
  description: string;
  startDate: string;
  endDate: string;
  studyTime: string;
  duration: string;
  goals: string[];
  priority: "low" | "medium" | "high";
  useAI: boolean;
}

const durations = [
  "30 minutes",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
  "4 hours",
];

const priorities: {
  value: "low" | "medium" | "high";
  label: string;
  color: string;
}[] = [
  {
    value: "low",
    label: "Low",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    value: "high",
    label: "High",
    color: "bg-red-100 text-red-700 border-red-300",
  },
];

const suggestedGoals = [
  "Complete all chapter exercises",
  "Review and summarize key concepts",
  "Practice past exam questions",
  "Create flashcards for memorization",
  "Watch supplementary video lectures",
  "Discuss topics with study group",
];

export default function CreateStudyPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newGoal, setNewGoal] = useState("");

  const [formData, setFormData] = useState<StudyPlanFormData>({
    title: "",
    subject: "",
    description: "",
    startDate: "",
    endDate: "",
    studyTime: "09:00",
    duration: "1 hour",
    goals: [],
    priority: "medium",
    useAI: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal !== goalToRemove),
    }));
  };

  const handleSuggestedGoal = (goal: string) => {
    if (!formData.goals.includes(goal)) {
      setFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, goal],
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Plan title is required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to planner on success
      router.push("/study/planner");
    } catch (error) {
      console.error("Error creating study plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAICreate = () => {
    // Navigate to chat with context for AI-assisted plan creation
    router.push("/study/chat?context=create-plan");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Study Support / Create Study Plan" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Study Support</span>
            </button>
          </Link>

          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create a Study Plan
              </h1>
              <p className="text-gray-500 text-sm">
                Plan your study sessions to achieve your learning goals
              </p>
            </div>
          </div>

          {/* AI Suggestion Card */}
          <div className="bg-gradient-to-r from-[#5A3FFF] to-[#300878] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Let AI Create Your Plan
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  Describe your study goals and let our AI assistant create a
                  personalized study plan with checkpoints and tasks.
                </p>
                <button
                  onClick={handleAICreate}
                  className="px-5 py-2.5 bg-white text-[#5A3FFF] rounded-xl font-medium text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create with AI
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">or create manually</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#5A3FFF]" />
                Plan Details
              </h2>

              <div className="space-y-4">
                {/* Plan Title */}
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
                    placeholder="e.g., Biology Exam Preparation"
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subject}
                    </p>
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
                    placeholder="Describe what you want to achieve with this study plan..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none"
                  />
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
                          setFormData((prev) => ({
                            ...prev,
                            priority: priority.value,
                          }))
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
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5A3FFF]" />
                Schedule
              </h2>

              <div className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.startDate ? "border-red-300" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.endDate ? "border-red-300" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Study Time and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="studyTime"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <Clock className="w-4 h-4 inline-block mr-1" />
                      Preferred Study Time
                    </label>
                    <input
                      type="time"
                      id="studyTime"
                      name="studyTime"
                      value={formData.studyTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Session Duration
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
                </div>
              </div>
            </div>

            {/* Goals Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#5A3FFF]" />
                Study Goals
              </h2>

              <div className="space-y-4">
                {/* Add Goal Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddGoal())
                    }
                    placeholder="Add a study goal..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-5 py-3 bg-[#5A3FFF] text-white rounded-xl font-medium text-sm hover:bg-[#4930CC] transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Goals */}
                {formData.goals.length > 0 && (
                  <div className="space-y-2">
                    {formData.goals.map((goal, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#F3F0FF] rounded-xl"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#5A3FFF] flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">
                          {goal}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(goal)}
                          className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Goals */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Suggested goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedGoals
                      .filter((goal) => !formData.goals.includes(goal))
                      .slice(0, 4)
                      .map((goal, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestedGoal(goal)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                        >
                          + {goal}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/study" className="flex-1">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white font-medium text-sm hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Study Plan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
