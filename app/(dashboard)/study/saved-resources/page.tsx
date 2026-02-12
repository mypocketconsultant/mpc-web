"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  Bookmark,
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Filter,
} from "lucide-react";
import Header from "@/app/components/header";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "link" | "image";
  subject: string;
  savedAt: Date;
  url?: string;
  thumbnail?: string;
}

const sampleResources: Resource[] = [
  {
    id: "1",
    title: "Biology Chapter 5 - Cell Division",
    description:
      "Comprehensive notes on mitosis and meiosis with diagrams and examples",
    type: "document",
    subject: "Biology",
    savedAt: new Date(2025, 9, 20),
  },
  {
    id: "2",
    title: "Introduction to Calculus - Video Lecture",
    description: "Khan Academy video explaining derivatives and integrals",
    type: "video",
    subject: "Mathematics",
    savedAt: new Date(2025, 9, 19),
    url: "https://example.com/calculus-video",
  },
  {
    id: "3",
    title: "English Literature - Shakespeare Analysis",
    description: "Analysis of themes in Hamlet and Macbeth",
    type: "document",
    subject: "English",
    savedAt: new Date(2025, 9, 18),
  },
  {
    id: "4",
    title: "Physics Formulas Reference Sheet",
    description: "Quick reference for mechanics, thermodynamics, and waves",
    type: "image",
    subject: "Physics",
    savedAt: new Date(2025, 9, 17),
  },
  {
    id: "5",
    title: "Chemistry Lab Safety Guidelines",
    description: "Important safety protocols for laboratory work",
    type: "link",
    subject: "Chemistry",
    savedAt: new Date(2025, 9, 16),
    url: "https://example.com/lab-safety",
  },
  {
    id: "6",
    title: "History Timeline - World War II",
    description: "Chronological events and key figures of WWII",
    type: "document",
    subject: "History",
    savedAt: new Date(2025, 9, 15),
  },
];

const resourceTypeIcons = {
  document: FileText,
  video: Video,
  link: LinkIcon,
  image: ImageIcon,
};

const resourceTypeColors = {
  document: "bg-blue-100 text-blue-600",
  video: "bg-red-100 text-red-600",
  link: "bg-green-100 text-green-600",
  image: "bg-purple-100 text-purple-600",
};

export default function SavedResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Get unique subjects from resources
  const subjects = Array.from(new Set(resources.map((r) => r.subject)));

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    const matchesSubject =
      selectedSubject === "all" || resource.subject === selectedSubject;
    return matchesSearch && matchesType && matchesSubject;
  });

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    setOpenMenuId(null);
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
      <Header title="Study Support / Saved Resources" />

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Saved Resources
                </h1>
                <p className="text-gray-500 text-sm">
                  {resources.length} resources saved
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent text-sm"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                  <option value="link">Links</option>
                  <option value="image">Images</option>
                </select>
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white min-w-[140px]"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const IconComponent = resourceTypeIcons[resource.type];
                const colorClasses = resourceTypeColors[resource.type];

                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${colorClasses} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === resource.id ? null : resource.id
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {openMenuId === resource.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-[#5A3FFF] bg-[#F3F0FF] px-2.5 py-1 rounded-full">
                        {resource.subject}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resource.savedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-[#5A3FFF]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchQuery || selectedType !== "all" || selectedSubject !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start saving resources from your study sessions to access them later."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
