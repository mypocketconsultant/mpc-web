"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ChevronLeft,
  Search,
  Bookmark,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
  File,
  StickyNote,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Loader2,
  Plus,
  Edit,
} from "lucide-react";
import Header from "@/app/components/header";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Resource {
  id: string;
  user_id: string;
  class_id: string;
  type: "pdf" | "docx" | "mp3" | "image" | "note" | "link" | "other";
  name: string;
  description?: string;
  url?: string;
  upload_id?: string;
  createdAt: string;
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

export default function ClassSavedResourcesPage() {
  const params = useParams();
  const classId = params.classId as string;
  const { toast, showToast, hideToast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "note" as Resource["type"],
    url: "",
  });

  // fetchResources - lines ~134-163
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/study/resources`,
        {
          params: {
            class_id: classId,
            resource_type: activeTab === 'all' ? undefined : activeTab,
          },
          withCredentials: true,
        }
      );

      let fetchedResources = response.data?.data || [];

      // Client-side search filtering
      if (searchQuery) {
        fetchedResources = fetchedResources.filter((r: Resource) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setResources(fetchedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, classId]);

  // handleAddResource - lines ~165-188
  const handleAddResource = async (data: Omit<Resource, 'id' | 'createdAt'>) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/study/resources`,
        {
          class_id: classId,
          resource_type: data.type,
          name: data.name,
          description: data.description,
          url: data.url,
        },
        { withCredentials: true }
      );

      if (response.data?.status === 'success') {
        setShowAddDialog(false);
        showToast('success', 'Resource added successfully!');
        fetchResources();
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      showToast('error', 'Failed to add resource');
    }
  };

  // handleEditResource - lines ~190-216
  const handleEditResource = async (data: Omit<Resource, 'id' | 'createdAt'>) => {
    if (!editingResource) return;

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/study/resources/${editingResource.id}`,
        {
          name: data.name,
          description: data.description,
          resource_type: data.type,
          url: data.url,
        },
        { withCredentials: true }
      );

      if (response.data?.status === 'success') {
        setEditingResource(null);
        showToast('success', 'Resource updated successfully!');
        fetchResources();
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      showToast('error', 'Failed to update resource');
    }
  };

  // handleDeleteResource - lines ~218-234
  const handleDeleteResource = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/study/resources/${id}`,
        { withCredentials: true }
      );

      if (response.data?.status === 'success') {
        showToast('success', 'Resource deleted successfully!');
        fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      showToast('error', 'Failed to delete resource');
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      type: "note",
      url: "",
    });
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (resource: Resource) => {
    setFormData({
      name: resource.name,
      description: resource.description || "",
      type: resource.type,
      url: resource.url || "",
    });
    setEditingResource(resource);
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resourceData = {
      user_id: "",
      class_id: classId,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      url: formData.url,
    };

    if (editingResource) {
      handleEditResource(resourceData);
    } else {
      handleAddResource(resourceData);
    }
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingResource(null);
    setFormData({
      name: "",
      description: "",
      type: "note",
      url: "",
    });
  };

  const filteredResources = resources;

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
          <Link href={`/study/chat/${classId}`}>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Class</span>
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
                  {isLoading ? "Loading..." : `${resources.length} resources`}
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center gap-2 px-4 py-2 bg-[#5A3FFF] text-white rounded-xl hover:bg-[#4A2FEF] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>

          {/* Search and Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {["all", "pdf", "docx", "mp3", "image", "note", "link", "other"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-[#5A3FFF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin" />
            </div>
          )}

          {/* Resources Grid */}
          {!isLoading && filteredResources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const IconComponent =
                  resourceTypeIcons[resource.type] || resourceTypeIcons.other;
                const colorClasses =
                  resourceTypeColors[resource.type] || resourceTypeColors.other;

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
                              onClick={() => handleOpenEditDialog(resource)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
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
                      <span className="text-xs font-medium text-[#5A3FFF] bg-[#F3F0FF] px-2.5 py-1 rounded-full">
                        {resource.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resource.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredResources.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-[#5A3FFF]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchQuery || activeTab !== "all"
                  ? "Try adjusting your search or filters."
                  : "Add your first resource to get started."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      {(showAddDialog || editingResource) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingResource ? "Edit Resource" : "Add Resource"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Resource["type"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
                >
                  <option value="note">Note</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">Document</option>
                  <option value="mp3">Audio</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#5A3FFF] text-white rounded-lg hover:bg-[#4A2FEF] transition-colors"
                >
                  {editingResource ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
