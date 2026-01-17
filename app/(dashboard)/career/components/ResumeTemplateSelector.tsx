"use client";

import { useState } from "react";
import { X, Check, Download } from "lucide-react";
import axios from "axios";

interface ProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface EducationData {
  nameOfSchool: string;
  fieldOfStudy: string;
  certification: string;
  year: string;
  descriptionGraduation: string;
}

interface ExperienceData {
  company: string;
  role: string;
  location: string;
  date: string;
  descriptionExperience: string;
}

interface ResumeTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeTitle: string;
  profile: ProfileData;
  educations: EducationData[];
  experience: ExperienceData[];
  skills: string[];
}

const templates = [
  {
    id: "classic",
    name: "Classic Template",
  },
  {
    id: "modern",
    name: "Modern Template",
  },
];

export default function ResumeTemplateSelector({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
  profile,
  educations,
  experience,
  skills,
}: ResumeTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("classic");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      console.log("[ResumeTemplateSelector] Downloading PDF with template:", selectedId);

      // Call API with template parameter
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/${resumeId}/export-pdf`,
        {
          params: {
            template: selectedId, // Pass selected template to backend
          },
          responseType: "blob",
          withCredentials: true,
        }
      );

      console.log("[ResumeTemplateSelector] PDF received, size:", response.data.size);

      // Create download link
      const pdfBlob = response.data as Blob;
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = `${resumeTitle || "resume"}_${selectedId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfBlobUrl);

      // Close modal after successful download
      onClose();
    } catch (error) {
      console.error("[ResumeTemplateSelector] Error downloading PDF:", error);
      alert("Failed to download resume. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Select Resume Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  selectedId === template.id
                    ? "ring-4 ring-[#5A3FFF] rounded-2xl"
                    : "hover:ring-2 hover:ring-gray-300 rounded-2xl"
                }`}
              >
                {/* Selection Indicator */}
                {selectedId === template.id && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="w-10 h-10 bg-[#5A3FFF] rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}

                {/* Template Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-[8.5/11] relative bg-gray-50">
                    <TemplatePreview
                      templateId={template.id}
                      profile={profile}
                      educations={educations}
                      experience={experience}
                      skills={skills}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto px-12 py-4 bg-[#5A3FFF] hover:bg-[#4A2FEF] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? "Downloading..." : "Download Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Template Preview Component with actual data
interface TemplatePreviewProps {
  templateId: string;
  profile: ProfileData;
  educations: EducationData[];
  experience: ExperienceData[];
  skills: string[];
}

function TemplatePreview({
  templateId,
  profile,
  educations,
  experience,
  skills,
}: TemplatePreviewProps) {
  if (templateId === "classic") {
    return (
      <div className="w-full h-full p-8 text-left overflow-hidden">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-3">
            <h3 className="text-lg font-bold">
              {profile.firstName || "First"} {profile.lastName || "Last"}
            </h3>
            <p className="text-[10px] text-gray-600">
              {profile.phoneNumber || "phone number"}
            </p>
          </div>

          {/* Education */}
          {educations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold mb-2">EDUCATION</h4>
              {educations.slice(0, 2).map((edu, idx) => (
                <div key={idx} className="space-y-1 mb-2">
                  <div className="flex justify-between text-[9px]">
                    <p className="font-semibold">{edu.nameOfSchool || "University Name"}</p>
                    <p>{edu.year || "Year"}</p>
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-600">
                    <p>{edu.certification || "Degree"}, {edu.fieldOfStudy || "Field of Study"}</p>
                  </div>
                  {edu.descriptionGraduation && (
                    <p className="text-[8px] text-gray-600 truncate">{edu.descriptionGraduation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h4 className="text-xs font-bold mb-2">EXPERIENCE</h4>
              {experience.slice(0, 2).map((exp, idx) => (
                <div key={idx} className="space-y-1 mb-2">
                  <div className="flex justify-between text-[9px]">
                    <p className="font-semibold">{exp.company || "Company"}</p>
                    <p>{exp.location || "Location"}</p>
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-600">
                    <p className="font-semibold">{exp.role || "Position"}</p>
                    <p className="italic">{exp.date || "Date"}</p>
                  </div>
                  {exp.descriptionExperience && (
                    <p className="text-[7px] text-gray-600 line-clamp-2">{exp.descriptionExperience}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold mb-1">SKILLS</h4>
              <p className="text-[8px] text-gray-600">{skills.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modern template
  return (
    <div className="w-full h-full p-8 text-left overflow-hidden">
      <div className="space-y-3">
        {/* Header */}
        <div className="text-center pb-3">
          <h3 className="text-lg font-bold mb-1">
            {profile.firstName || "First"} {profile.lastName || "Last"}
          </h3>
          <p className="text-[10px] text-gray-600">
            {profile.phoneNumber || "phone number"}
          </p>
        </div>

        {/* Education */}
        {educations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold border-b border-gray-300 mb-2 pb-1">EDUCATION</h4>
            {educations.slice(0, 2).map((edu, idx) => (
              <div key={idx} className="space-y-1 mb-2">
                <div className="flex justify-between text-[9px]">
                  <div>
                    <p className="font-semibold">{edu.nameOfSchool || "University Name"}</p>
                    <p className="text-gray-600">{edu.certification || "Degree"}, {edu.fieldOfStudy || "Field"}</p>
                  </div>
                  <div className="text-right">
                    <p>{edu.year || "Year"}</p>
                  </div>
                </div>
                {edu.descriptionGraduation && (
                  <p className="text-[8px] text-gray-600 truncate">{edu.descriptionGraduation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h4 className="text-xs font-bold border-b border-gray-300 mb-2 pb-1">EXPERIENCE</h4>
            {experience.slice(0, 2).map((exp, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between text-[9px] mb-1">
                  <p className="font-semibold">{exp.company || "Company"}</p>
                  <p>{exp.location || "Location"}</p>
                </div>
                <div className="flex justify-between text-[8px] text-gray-600 mb-1">
                  <p className="font-semibold">{exp.role || "Position"}</p>
                  <p className="italic">{exp.date || "Date"}</p>
                </div>
                {exp.descriptionExperience && (
                  <p className="text-[7px] text-gray-600 leading-tight line-clamp-2">
                    {exp.descriptionExperience}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h4 className="text-xs font-bold border-b border-gray-300 mb-1 pb-1">SKILLS</h4>
            <p className="text-[8px] text-gray-600">{skills.join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}