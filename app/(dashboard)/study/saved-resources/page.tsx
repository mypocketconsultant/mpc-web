"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  Bookmark,
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
  File,
  StickyNote,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Filter,
  Loader2,
  Plus,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Resource {
  id: string;
  user_id: string;
  class_id: string;
  resource_type: "pdf" | "docx" | "mp3" | "image" | "note" | "link" | "other";
  name: string;
  description?: string;
  url?: string;
  upload_id?: string;
  created_at: string;
  updated_at: string;
}

interface StudyClass {
  id: string;
  title: string;
  subject?: string;
}

const resourceTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  mp3: Music,
  image: ImageIcon,
  note: StickyNote,
  link: LinkIcon,
  other: File,
};

const resourceTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  docx: "bg-blue-100 text-blue-600",
  mp3: "bg-orange-100 text-orange-600",
  image: "bg-purple-100 text-purple-600",
  note: "bg-yellow-100 text-yellow-600",
  link: "bg-green-100 text-green-600",
  other: "bg-gray-100 text-gray-600",
};

const resourceTypeLabels: Record<string, string> = {
  pdf: "PDF",
  docx: "Document",
  mp3: "Audio",
  image: "Image",
  note: "Note",
  link: "Link",
  other: "Other",
};

export default function SavedResourcesPage() {
  const { toast, showToast, hideToast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build class_id → class title lookup
  const classTitles: Record<string, string> = {};
  classes.forEach((c) => {
    classTitles[c.id] = c.title;
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resourcesRes, classesRes] = await Promise.all([
        apiService.get("/v1/study/resources") as Promise<any>,
        apiService.get("/v1/study/classes") as Promise<any>,
      ]);

      const resourcesData = resourcesRes?.data || resourcesRes || [];
      setResources(Array.isArray(resourcesData) ? resourcesData : []);

      const classesData = classesRes?.data || classesRes || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter resources client-side
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || resource.resource_type === selectedType;
    const matchesClass =
      selectedClass === "all" || resource.class_id === selectedClass;
    return matchesSearch && matchesType && matchesClass;
  });

  const handleDeleteResource = async (id: string) => {
    setDeletingId(id);
    setOpenMenuId(null);
    try {
      await apiService.delete(`/v1/study/resources/${id}`);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Resource deleted.");
    } catch (error) {
      console.error("Failed to delete resource:", error);
      showToast("error", "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Toast toast={toast} onClose={hideToast} />
      <Header title="Study Support" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Study Support / Saved Resources</span>
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
                  {loading ? "Loading..." : `${resources.length} resources saved`}
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
                  <option value="pdf">PDF</option>
                  <option value="docx">Document</option>
                  <option value="mp3">Audio</option>
                  <option value="image">Image</option>
                  <option value="note">Note</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white min-w-[140px]"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin" />
            </div>
          )}

          {/* Resources Grid */}
          {!loading && filteredResources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const IconComponent =
                  resourceTypeIcons[resource.resource_type] || resourceTypeIcons.other;
                const colorClasses =
                  resourceTypeColors[resource.resource_type] || resourceTypeColors.other;
                const isDeleting = deletingId === resource.id;

                return (
                  <div
                    key={resource.id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
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
                      {resource.name}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-[#5A3FFF] bg-[#F3F0FF] px-2.5 py-1 rounded-full truncate max-w-[120px]">
                        {classTitles[resource.class_id] || resource.resource_type}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resource.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredResources.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-[#5A3FFF]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchQuery || selectedType !== "all" || selectedClass !== "all"
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
