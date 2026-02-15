"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface StudyClass {
  id: string;
  name: string;
  subject?: string;
  color?: string;
}

interface ClassSelectionSidebarProps {
  classes: StudyClass[];
  selectedClassId: string | null;
  onSelectClass: (classItem: StudyClass) => void;
  onAddClass: (className: string) => void;
  onDeleteClass?: (classId: string) => void;
}

export default function ClassSelectionSidebar({
  classes,
  selectedClassId,
  onSelectClass,
  onAddClass,
  onDeleteClass,
}: ClassSelectionSidebarProps) {
  const [newClassName, setNewClassName] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName("");
      setIsAddingClass(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddClass();
    }
    if (e.key === "Escape") {
      setIsAddingClass(false);
      setNewClassName("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, classId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(classId);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId) {
      onDeleteClass?.(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 text-sm">Past Classes</h3>
      </div>

      {/* Add New Class Button */}
      <div className="p-4 border-b border-gray-100">
        {isAddingClass ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add class title"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
                className="flex-1 py-1.5 text-xs font-medium text-white bg-[#5A3FFF] rounded-lg hover:bg-[#4930CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingClass(false);
                  setNewClassName("");
                }}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingClass(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#5A3FFF] text-white rounded-lg font-medium text-sm hover:bg-[#4930CC] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add new class
          </button>
        )}
      </div>

      {/* Class List */}
      <div className="flex-1 overflow-y-auto p-2">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No classes yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add your first class to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {classes.map((classItem) => {
              const isSelected = selectedClassId === classItem.id;
              const isConfirming = confirmDeleteId === classItem.id;

              if (isConfirming) {
                return (
                  <div
                    key={classItem.id}
                    className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200"
                  >
                    <p className="text-xs text-red-700 mb-2">
                      Delete <strong>{classItem.name}</strong> and all its messages?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmDelete}
                        className="flex-1 py-1 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="flex-1 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={classItem.id}
                  className={`group flex items-center rounded-xl transition-all ${
                    isSelected
                      ? "bg-[#E8E0FF] border-l-4 border-l-[#5A3FFF]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => onSelectClass(classItem)}
                    className={`flex-1 text-left px-4 py-3 text-sm font-medium ${
                      isSelected ? "text-[#5A3FFF]" : "text-gray-700"
                    }`}
                  >
                    {classItem.name}
                  </button>
                  {onDeleteClass && (
                    <button
                      onClick={(e) => handleDeleteClick(e, classItem.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 mr-1 text-gray-400 hover:text-red-500 transition-all"
                      aria-label={`Delete ${classItem.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
