"use client";

import React from "react";

interface Section {
  name: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface AnalysisPlan {
  overall_score?: number;
  summary?: string;
  target_role?: string;
  sections: Section[];
  [key: string]: any; // Allow for any additional fields from AI
}

interface AnalysisMessageComponentProps {
  content: string;
  analysisPlan: AnalysisPlan;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function AnalysisMessageComponent({
  content,
  analysisPlan,
  isExpanded,
  onToggleExpanded,
}: AnalysisMessageComponentProps) {
  // Debug logging
  console.log('[AnalysisMessageComponent] Rendering with:', {
    contentPreview: content?.substring(0, 50),
    targetRole: analysisPlan?.target_role,
    sectionsCount: analysisPlan?.sections?.length,
    sections: analysisPlan?.sections,
    isExpanded
  });

  return (
    <div className="space-y-3">
      {/* Opening Content Message - Always show full content */}
      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
        {content}
      </p>

      {/* Target Role (if available) */}
      {analysisPlan.target_role && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
            Target Role:
          </span>
          <span className="text-sm font-medium text-purple-800 ml-2">
            {analysisPlan.target_role}
          </span>
        </div>
      )}

      {/* Overall Score Card (if available) */}
      {(analysisPlan.overall_score !== undefined || analysisPlan.summary) && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          {analysisPlan.overall_score !== undefined && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Overall Score
              </span>
              <span className="text-lg font-bold text-blue-600">
                {analysisPlan.overall_score}/10
              </span>
            </div>
          )}
          {analysisPlan.summary && (
            <p className="text-sm text-blue-900 leading-relaxed">
              {analysisPlan.summary}
            </p>
          )}
        </div>
      )}

      {/* Section Summaries - Always visible */}
      <div className="space-y-3">
        {analysisPlan.sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors"
          >
            {/* Section Header with Score - Always visible */}
            <div className={`flex items-center justify-between ${isExpanded ? 'mb-3 pb-2 border-b border-blue-50' : ''}`}>
              <h4 className="text-sm font-bold text-gray-900">
                {section.name}
              </h4>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                {section.score}/10
              </span>
            </div>

            {/* Detailed Issues and Recommendations - Only when expanded */}
            {isExpanded && (
              <>
                {/* Issues Section */}
                {section.issues && section.issues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">
                      Issues
                    </p>
                    <ul className="space-y-1">
                      {section.issues.map((issue, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-700 flex gap-2 items-start"
                        >
                          <span className="text-red-500 font-bold flex-shrink-0">
                            •
                          </span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations Section */}
                {section.recommendations &&
                  section.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                        Recommendations
                      </p>
                      <ul className="space-y-1">
                        {section.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-700 flex gap-2 items-start"
                          >
                            <span className="text-green-600 font-bold flex-shrink-0">
                              ✓
                            </span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Toggle Button - Always show if there are sections */}
      {analysisPlan.sections.length > 0 && (
        <button
          onClick={onToggleExpanded}
          className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer transition-colors mt-2 w-full text-left"
        >
          {isExpanded ? (
            <>Hide details</>
          ) : (
            <>See issues & recommendations</>
          )}
        </button>
      )}
    </div>
  );
}

