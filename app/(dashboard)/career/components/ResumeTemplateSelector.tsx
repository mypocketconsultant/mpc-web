"use client";

import { useState } from "react";
import { X, Check, Download } from "lucide-react";
import axios from "axios";

interface ProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
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
    id: "template_1",
    name: "Classic",
    description: "Traditional serif Harvard-style resume",
  },
  {
    id: "template_2",
    name: "Modern",
    description: "Clean sans-serif professional resume",
  },
];

function buildPdfPayload(
  templateId: string,
  resumeTitle: string,
  profile: ProfileData,
  educations: EducationData[],
  experience: ExperienceData[],
  skills: string[],
) {
  return {
    template_id: templateId,
    filename: `${resumeTitle || "resume"}.pdf`,
    data: {
      contact: {
        full_name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phoneNumber || undefined,
        email: profile.email || undefined,
      },
      education: educations.map((edu) => ({
        institution: edu.nameOfSchool,
        degree: [edu.certification, edu.fieldOfStudy]
          .filter(Boolean)
          .join(", ") || undefined,
        graduation_date: edu.year || undefined,
      })),
      experience: experience.map((exp) => ({
        organization: exp.company,
        title: exp.role || undefined,
        location: exp.location || undefined,
        dates: exp.date || undefined,
        bullets: exp.descriptionExperience
          ? exp.descriptionExperience.split("\n").filter((s) => s.trim())
          : undefined,
      })),
      skills:
        skills.length > 0
          ? [{ label: "Skills", value: skills.join(", ") }]
          : [],
    },
  };
}

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
  const [selectedId, setSelectedId] = useState<string>("template_1");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const payload = buildPdfPayload(
        selectedId,
        resumeTitle,
        profile,
        educations,
        experience,
        skills,
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/generate-pdf`,
        payload,
        {
          withCredentials: true,
        },
      );

      const downloadUrl = response.data?.data?.download_url;
      if (!downloadUrl) {
        throw new Error("No download URL returned");
      }

      // Fetch the Cloudinary URL as blob to guarantee download behavior
      const pdfResponse = await fetch(downloadUrl);
      const blob = await pdfResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        response.data?.data?.filename ||
        `${resumeTitle || "resume"}_${selectedId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      onClose();
    } catch (error) {
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
                  <div className="aspect-[8.5/11] relative bg-white">
                    <TemplatePreview
                      templateId={template.id}
                      profile={profile}
                      educations={educations}
                      experience={experience}
                      skills={skills}
                    />
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
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
  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    "Your Name";
  const contactParts = [profile.email, profile.phoneNumber].filter(Boolean);

  const bullets = (text: string) =>
    text
      .split("\n")
      .filter((s) => s.trim());

  if (templateId === "template_1") {
    /* ─── Classic: Times New Roman, serif, Harvard-style ─── */
    return (
      <div
        className="w-full h-full text-left overflow-hidden text-black"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: "10.5px",
          lineHeight: 1.45,
          padding: "28px 36px",
        }}
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 6 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 4,
            }}
          >
            {fullName}
          </h3>
          <p style={{ fontSize: "9.5px", color: "#000" }}>
            {contactParts.length > 0 ? contactParts.join(" | ") : "contact info"}
          </p>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #000", margin: "6px 0" }} />

        {/* Education */}
        {educations.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginTop: 10,
                marginBottom: 5,
                borderBottom: "1px solid #000",
                paddingBottom: 1,
              }}
            >
              Education
            </div>
            {educations.slice(0, 2).map((edu, idx) => (
              <div key={idx} style={{ marginBottom: 7 }}>
                <div className="flex justify-between items-baseline">
                  <span style={{ fontWeight: "bold", fontSize: "10.5px" }}>
                    {edu.nameOfSchool || "University Name"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontStyle: "italic",
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {(edu as any).location || ""}
                  </span>
                </div>
                <div className="flex justify-between items-baseline" style={{ marginTop: 1 }}>
                  <span style={{ fontStyle: "italic", fontSize: "10px" }}>
                    {[edu.certification, edu.fieldOfStudy].filter(Boolean).join(", ") || "Degree"}
                  </span>
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {edu.year || "Year"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginTop: 10,
                marginBottom: 5,
                borderBottom: "1px solid #000",
                paddingBottom: 1,
              }}
            >
              Experience
            </div>
            {experience.slice(0, 2).map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 7 }}>
                <div className="flex justify-between items-baseline">
                  <span style={{ fontWeight: "bold", fontSize: "10.5px" }}>
                    {exp.company || "Company"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontStyle: "italic",
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {exp.location || "Location"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline" style={{ marginTop: 1 }}>
                  <span style={{ fontStyle: "italic", fontSize: "10px" }}>
                    {exp.role || "Position"}
                  </span>
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {exp.date || "Date"}
                  </span>
                </div>
                {exp.descriptionExperience && (
                  <ul style={{ marginLeft: 16, marginTop: 3 }}>
                    {bullets(exp.descriptionExperience)
                      .slice(0, 3)
                      .map((b, i) => (
                        <li
                          key={i}
                          style={{ fontSize: "10px", marginBottom: 2 }}
                          className="list-disc"
                        >
                          <span className="line-clamp-1">{b}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills & Interests */}
        {skills.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginTop: 10,
                marginBottom: 5,
                borderBottom: "1px solid #000",
                paddingBottom: 1,
              }}
            >
              Skills &amp; Interests
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: "10px", marginBottom: 3 }}>
                <span style={{ fontWeight: "bold" }}>Skills:</span>{" "}
                {skills.join(", ")}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Modern: Arial, sans-serif, clean professional ─── */
  return (
    <div
      className="w-full h-full text-left overflow-hidden"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10px",
        color: "#1a1a1a",
        lineHeight: 1.5,
        padding: "28px 38px",
      }}
    >
      {/* Header */}
      <div className="text-center" style={{ marginBottom: 10 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: "bold",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 5,
            color: "#000",
          }}
        >
          {fullName}
        </h3>
        <p style={{ fontSize: "9px", color: "#333", letterSpacing: "0.3px" }}>
          {contactParts.length > 0 ? contactParts.join(" | ") : "contact info"}
        </p>
      </div>

      {/* Divider */}
      <hr style={{ border: "none", borderTop: "1.5px solid #000", margin: "7px 0" }} />

      {/* Education */}
      {educations.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginTop: 12,
              marginBottom: 6,
              color: "#000",
            }}
          >
            Education
          </div>
          {educations.slice(0, 2).map((edu, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {edu.nameOfSchool || "University Name"}
                </span>
                <span
                  style={{
                    fontSize: "9.5px",
                    color: "#444",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {(edu as any).location || ""}
                </span>
              </div>
              <div className="flex justify-between items-baseline" style={{ marginTop: 1 }}>
                <span style={{ fontStyle: "italic", fontSize: "9.5px", color: "#333" }}>
                  {[edu.certification, edu.fieldOfStudy].filter(Boolean).join(", ") || "Degree"}
                </span>
                <span
                  style={{
                    fontSize: "9.5px",
                    color: "#555",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {edu.year || "Year"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginTop: 12,
              marginBottom: 6,
              color: "#000",
            }}
          >
            Experience
          </div>
          {experience.slice(0, 2).map((exp, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {exp.company || "Company"}
                </span>
                <span
                  style={{
                    fontSize: "9.5px",
                    color: "#444",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {exp.location || "Location"}
                </span>
              </div>
              <div className="flex justify-between items-baseline" style={{ marginTop: 1 }}>
                <span style={{ fontStyle: "italic", fontSize: "9.5px", color: "#333" }}>
                  {exp.role || "Position"}
                </span>
                <span
                  style={{
                    fontSize: "9.5px",
                    color: "#555",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {exp.date || "Date"}
                </span>
              </div>
              {exp.descriptionExperience && (
                <ul style={{ marginLeft: 15, marginTop: 4 }}>
                  {bullets(exp.descriptionExperience)
                    .slice(0, 3)
                    .map((b, i) => (
                      <li
                        key={i}
                        style={{ fontSize: "9.5px", color: "#222", marginBottom: 2 }}
                        className="list-disc"
                      >
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills & Interests */}
      {skills.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginTop: 12,
              marginBottom: 6,
              color: "#000",
            }}
          >
            Skills &amp; Interests
          </div>
          <div style={{ marginTop: 2 }}>
            <div style={{ fontSize: "9.5px", marginBottom: 3 }}>
              <span style={{ fontWeight: "bold" }}>Skills:</span>{" "}
              {skills.join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
