"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  Calendar,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import Header from "@/app/components/header";

interface ClassSchedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ClassFormData {
  name: string;
  subject: string;
  instructor: string;
  description: string;
  location: string;
  color: string;
  schedules: ClassSchedule[];
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const colorOptions = [
  { value: "purple", bg: "bg-[#5A3FFF]", label: "Purple" },
  { value: "blue", bg: "bg-[#3B82F6]", label: "Blue" },
  { value: "green", bg: "bg-[#10B981]", label: "Green" },
  { value: "orange", bg: "bg-[#F59E0B]", label: "Orange" },
  { value: "pink", bg: "bg-[#EC4899]", label: "Pink" },
  { value: "red", bg: "bg-[#EF4444]", label: "Red" },
];

export default function CreateClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClassFormData>({
    name: "",
    subject: "",
    instructor: "",
    description: "",
    location: "",
    color: "purple",
    schedules: [
      {
        id: `schedule-${Date.now()}`,
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
      },
    ],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleScheduleChange = (
    scheduleId: string,
    field: keyof ClassSchedule,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === scheduleId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const addSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          id: `schedule-${Date.now()}`,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    }));
  };

  const removeSchedule = (scheduleId: string) => {
    if (formData.schedules.length > 1) {
      setFormData((prev) => ({
        ...prev,
        schedules: prev.schedules.filter((s) => s.id !== scheduleId),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
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

      // Navigate back to study page on success
      router.push("/study");
    } catch (error) {
      console.error("Error creating class:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Study Support / Create Class" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6">
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
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create a New Class
              </h1>
              <p className="text-gray-500 text-sm">
                Add a new class to your study schedule
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Class Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Class Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Advanced Mathematics"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                    placeholder="e.g., Mathematics, Science, English"
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

                {/* Instructor */}
                <div>
                  <label
                    htmlFor="instructor"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    <Users className="w-4 h-4 inline-block mr-1" />
                    Instructor
                  </label>
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Smith"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Room 101, Building A"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
                  />
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
                    placeholder="Add any notes about this class..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            color: color.value,
                          }))
                        }
                        className={`w-10 h-10 rounded-full ${color.bg} transition-all ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                            : "hover:scale-105"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  <Calendar className="w-5 h-5 inline-block mr-2" />
                  Class Schedule
                </h2>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#5A3FFF] hover:bg-[#F3F0FF] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              </div>

              <div className="space-y-4">
                {formData.schedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {/* Day Select */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Day
                      </label>
                      <select
                        value={schedule.day}
                        onChange={(e) =>
                          handleScheduleChange(
                            schedule.id,
                            "day",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white"
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time */}
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3 inline-block mr-1" />
                        Start
                      </label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          handleScheduleChange(
                            schedule.id,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm"
                      />
                    </div>

                    {/* End Time */}
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3 inline-block mr-1" />
                        End
                      </label>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          handleScheduleChange(
                            schedule.id,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeSchedule(schedule.id)}
                      disabled={formData.schedules.length === 1}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove time slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                {isSubmitting ? "Creating..." : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
