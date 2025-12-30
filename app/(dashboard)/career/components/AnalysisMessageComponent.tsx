"use client";

import React from "react";

interface Section {
  name: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface AnalysisPlan {
  overall_score: number;
  summary: string;
  sections: Section[];
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
  // Calculate total character count for expand/collapse logic
  const analysisText = formatAnalysisToText(analysisPlan);
  const totalLength = content.length + analysisText.length;
  const shouldShowToggle = totalLength > 200;

  // Truncate for preview
  const previewLength = 200;
  const truncatedAnalysis =
    !isExpanded && totalLength > previewLength
      ? (content + analysisText).substring(0, previewLength) + "..."
      : null;

  return (
    <div className="space-y-3">
      {/* Opening Content Message */}
      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
        {truncatedAnalysis || content}
      </p>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
            Overall Score
          </span>
          <span className="text-lg font-bold text-blue-600">
            {analysisPlan.overall_score}/10
          </span>
        </div>
        <p className="text-sm text-blue-900 leading-relaxed">
          {analysisPlan.summary}
        </p>
      </div>

      {/* Detailed Sections - Show/Hide with Toggle */}
      {isExpanded && (
        <div className="space-y-3">
          {analysisPlan.sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors"
            >
              {/* Section Header with Score */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-50">
                <h4 className="text-sm font-bold text-gray-900">
                  {section.name}
                </h4>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                  {section.score}/10
                </span>
              </div>

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
            </div>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      {shouldShowToggle && (
        <button
          onClick={onToggleExpanded}
          className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer transition-colors mt-2 w-full text-left"
        >
          {isExpanded ? (
            <>
              See less ({analysisPlan.sections.length} sections)
            </>
          ) : (
            <>
              See detailed feedback ({analysisPlan.sections.length} sections)
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Helper function to format analysis as text (for length calculation)
function formatAnalysisToText(analysisPlan: AnalysisPlan): string {
  let text = `\n\nOverall Score: ${analysisPlan.overall_score}/10\n${analysisPlan.summary}`;

  analysisPlan.sections.forEach((section) => {
    text += `\n\n${section.name} (${section.score}/10)`;
    if (section.issues?.length) {
      text += `\nIssues: ${section.issues.join(", ")}`;
    }
    if (section.recommendations?.length) {
      text += `\nRecommendations: ${section.recommendations.join(", ")}`;
    }
  });

  return text;
}
