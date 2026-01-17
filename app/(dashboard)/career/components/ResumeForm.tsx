/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, JSX } from "react";
import { X, ChevronDown } from "lucide-react";
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

interface ResumeFormProps {
  onNext?: (resumeId: string, resumeData: any, aiAnalysis: any) => void;
  onClose?: () => void;
  resetTrigger?: number;
  initialFormData?: {
    documentTitle?: string;
    profile?: ProfileData;
    educations?: EducationData[];
    experience?: ExperienceData[];
    skills?: string[];
  };
  // Lifted state from parent
  documentTitle?: string;
  onDocumentTitleChange?: (value: string) => void;
  profile?: ProfileData;
  onProfileChange?: (field: keyof ProfileData, value: string) => void;
  educations?: EducationData[];
  onAddEducation?: () => void;
  onUpdateEducation?: (index: number, field: keyof EducationData, value: string) => void;
  onDeleteEducation?: (index: number) => void;
  expandedEducationIndex?: number | null;
  onEducationExpand?: (index: number | null) => void;
  experience?: ExperienceData[];
  onAddExperience?: () => void;
  onUpdateExperience?: (index: number, field: keyof ExperienceData, value: string) => void;
  onDeleteExperience?: (index: number) => void;
  expandedSectionIndex?: number | null;
  onExperienceExpand?: (index: number | null) => void;
  skills?: string[];
  onSkillsChange?: (skills: string[]) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onNewResume?: () => void;
  resumeId?: string | null;
  onDownloadResume?: () => void;
}

interface StepConfig {
  title: string;
  description: string;
}

const STEP_CONFIG: Record<number, StepConfig> = {
  1: { title: "Profile", description: "Add your personal information" },
  2: { title: "Education", description: "Share your educational background" },
  3: {
    title: "Experience",
    description: "Detail your professional experience",
  },
  4: { title: "Skill", description: "List your key skills" },
};

const INITIAL_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
};

const INITIAL_EDUCATION: EducationData = {
  nameOfSchool: "",
  fieldOfStudy: "",
  certification: "",
  year: "",
  descriptionGraduation: "",
};

const INITIAL_EXPERIENCE: ExperienceData = {
  company: "",
  role: "",
  location: "",
  date: "",
  descriptionExperience: "",
};

// Validation helper functions
const isProfileValid = (profile: ProfileData): boolean => {
  return (
    profile.firstName.trim() !== "" &&
    profile.lastName.trim() !== "" &&
    profile.phoneNumber.trim() !== ""
  );
};

const isEducationEntryValid = (edu: EducationData): boolean => {
  return (
    edu.nameOfSchool.trim() !== "" &&
    edu.fieldOfStudy.trim() !== "" &&
    edu.certification.trim() !== "" &&
    edu.year.trim() !== "" &&
    edu.descriptionGraduation.trim() !== ""
  );
};

const areAllEducationsValid = (educations: EducationData[]): boolean => {
  return educations.length > 0 && educations.every(isEducationEntryValid);
};

const isExperienceEntryValid = (exp: ExperienceData): boolean => {
  return (
    exp.company.trim() !== "" &&
    exp.role.trim() !== "" &&
    exp.location.trim() !== "" &&
    exp.date.trim() !== "" &&
    exp.descriptionExperience.trim() !== ""
  );
};

const areAllExperiencesValid = (experiences: ExperienceData[]): boolean => {
  return experiences.length > 0 && experiences.every(isExperienceEntryValid);
};

const areSkillsValid = (skills: string[]): boolean => {
  return skills.length >= 1;
};

export default function ResumeForm({
  onNext,
  onClose,
  resetTrigger,
  initialFormData,
  // Lifted state
  documentTitle: propDocumentTitle,
  onDocumentTitleChange,
  profile: propProfile,
  onProfileChange,
  educations: propEducations,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  expandedEducationIndex: propExpandedEducationIndex,
  onEducationExpand,
  experience: propExperience,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  expandedSectionIndex: propExpandedSectionIndex,
  onExperienceExpand,
  skills: propSkills,
  onSkillsChange,
  currentStep: propCurrentStep,
  onStepChange,
  onNewResume,
  resumeId,
  onDownloadResume,
}: ResumeFormProps) {
  // State setters use lifted callbacks if provided
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convenience getters that prefer lifted props
  const currentStep = propCurrentStep !== undefined ? propCurrentStep : 1;
  const documentTitle = propDocumentTitle !== undefined ? propDocumentTitle : "";
  const profile = propProfile || INITIAL_PROFILE;
  const educations = propEducations || [];
  const experience = propExperience || [];
  const skills = propSkills || ["Interview", "Career", "Design"];
  const expandedEducationIndex = propExpandedEducationIndex !== undefined ? propExpandedEducationIndex : null;
  const expandedSectionIndex = propExpandedSectionIndex !== undefined ? propExpandedSectionIndex : null;

  // Initialize form with data when initialFormData is provided
  React.useEffect(() => {
    if (initialFormData) {
      console.log('[ResumeForm] Initializing form with data:', initialFormData);
      if (initialFormData.documentTitle && onDocumentTitleChange) {
        onDocumentTitleChange(initialFormData.documentTitle);
      }
      if (initialFormData.profile && onProfileChange) {
        Object.entries(initialFormData.profile).forEach(([key, value]) => {
          onProfileChange(key as keyof ProfileData, value as string);
        });
      }
      if (initialFormData.educations && initialFormData.educations.length > 0 && onUpdateEducation) {
        initialFormData.educations.forEach((edu, idx) => {
          Object.entries(edu).forEach(([key, value]) => {
            onUpdateEducation(idx, key as keyof EducationData, value as string);
          });
        });
      }
      if (initialFormData.skills && initialFormData.skills.length > 0 && onSkillsChange) {
        onSkillsChange(initialFormData.skills);
      }
      console.log('[ResumeForm] Form initialized successfully');
    }
  }, [initialFormData, onDocumentTitleChange, onProfileChange, onUpdateEducation, onSkillsChange]);

  // Watch for reset trigger and reset to step 1
  React.useEffect(() => {
    if (resetTrigger !== undefined && onStepChange) {
      onStepChange(1);
      console.log('[ResumeForm] Form reset to step 1');
    }
  }, [resetTrigger, onStepChange]);

  const handleProfileChange = (
    field: keyof ProfileData,
    value: string
  ): void => {
    if (onProfileChange) {
      onProfileChange(field, value);
    }
  };

  const handleAddEducation = (): void => {
    if (educations.length < 9 && onAddEducation) {
      onAddEducation();
    }
  };

  const handleUpdateEducation = (
    index: number,
    field: keyof EducationData,
    value: string
  ): void => {
    if (onUpdateEducation) {
      onUpdateEducation(index, field, value);
    }
  };

  const handleDeleteEducation = (index: number): void => {
    if (onDeleteEducation) {
      onDeleteEducation(index);
    }
  };

  const handleAddExperience = (): void => {
    if (experience.length < 9 && onAddExperience) {
      onAddExperience();
    }
  };

  const handleUpdateExperience = (
    index: number,
    field: keyof ExperienceData,
    value: string
  ): void => {
    if (onUpdateExperience) {
      onUpdateExperience(index, field, value);
    }
  };

  const handleDeleteExperience = (index: number): void => {
    if (onDeleteExperience) {
      onDeleteExperience(index);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (currentStep < 4) {
      // Validate step 2 (education) before moving forward
      if (currentStep === 2 && (educations.length < 1 || educations.length > 9)) {
        console.error("Education must be between 1 and 9");
        return;
      }
      // Validate step 3 (experience) before moving forward
      if (currentStep === 3 && (experience.length < 1 || experience.length > 9)) {
        console.error("Experience must be between 1 and 9");
        return;
      }
      if (onStepChange) {
        onStepChange(currentStep + 1);
      }
    } else {
      // Validate final step before submission
      if (educations.length < 1 || educations.length > 9) {
        console.error("Education must be between 1 and 9");
        return;
      }
      if (experience.length < 1 || experience.length > 9) {
        console.error("Experience must be between 1 and 9");
        return;
      }
      if (skills.length < 1) {
        console.error("At least one skill is required");
        return;
      }

      // Submit resume to backend
      setIsSubmitting(true);
      try {
        console.log("[ResumeForm] Stage 1: Preparing payload");
        const payload = {
          title: documentTitle || "My Resume",
          profile,
          education: educations,
          experience,
          skills,
        };
        console.log("[ResumeForm] Stage 2: Payload prepared", payload);

        // Check if updating existing resume or creating new one
        const currentResumeId = typeof window !== 'undefined' ? sessionStorage.getItem('currentResumeId') : null;
        console.log("[ResumeForm] Stage 2.5: currentResumeId from sessionStorage:", currentResumeId);

        let apiUrl: string;
        if (currentResumeId) {
          // Update existing resume
          apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/${currentResumeId}/update`;
          console.log("[ResumeForm] Stage 3: Updating existing resume at", apiUrl);
        } else {
          // Create new resume
          apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/submit`;
          console.log("[ResumeForm] Stage 3: Creating new resume at", apiUrl);
        }

        const response = await axios.post(
          apiUrl,
          payload,
          {
            withCredentials: true,
          }
        );

        console.log("[ResumeForm] Stage 4: Response received from backend", response.data);

        // Extract resumeId, resumeData and full response data from response
        const resumeId = response.data?.data?.resume?.id;
        const resumeData = response.data?.data?.resume;
        const responseData = response.data?.data;

        console.log("[ResumeForm] Stage 5: Extracted resumeId:", resumeId);
        console.log("[ResumeForm] Stage 6: Extracted resumeData:", resumeData);
        console.log("[ResumeForm] Stage 7: Extracted responseData with messages:", responseData?.messages?.length, "messages");

        // Pass to parent component
        console.log("[ResumeForm] Stage 8: Calling onNext callback");
        onNext?.(resumeId, resumeData, responseData);
        console.log("[ResumeForm] Stage 9: Resume submission complete");
        setIsSubmitting(false);
      } catch (error) {
        console.error("[ResumeForm] ERROR at submission stage:", error);
        if (axios.isAxiosError(error)) {
          console.error("[ResumeForm] Axios error status:", error.response?.status);
          console.error("[ResumeForm] Axios error response:", error.response?.data);
        }
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = (): void => {
    if (currentStep > 1 && onStepChange) {
      onStepChange(currentStep - 1);
    }
  };

  const getProgressPercentage = (): number => {
    return (currentStep / 4) * 100;
  };

  const isFirstStep = (): boolean => currentStep === 1;
  const isLastStep = (): boolean => currentStep === 4;
  const currentStepConfig = STEP_CONFIG[currentStep];

  return (
    <div className="p-8 relative">
      {/* Header with buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex gap-2">
            <button
              onClick={onNewResume}
              className="px-6 py-2 rounded-full font-bold text-sm bg-[#5A3FFF] text-white transition-colors"
            >
              New Resume
            </button>
            <button
              onClick={onDownloadResume}
              disabled={!resumeId}
              title={resumeId ? "Download resume as PDF" : "Create or load a resume first"}
              className="px-6 py-2 rounded-full font-bold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Download Resume
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close form"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Document Title */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Add title of document"
          value={documentTitle}
          onChange={(e) => onDocumentTitleChange?.(e.target.value)}
          className="w-full text-gray-400 text-sm outline-none placeholder-gray-400"
          aria-label="Document title"
        />
        <div className="h-px bg-gray-200 mt-2"></div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {currentStepConfig.title}
          </h3>
          <span className="text-sm text-gray-600">{currentStep}/4</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5A3FFF] transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={4}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4 min-h-[300px]">
        {/* Step 1: Profile */}
        {currentStep === 1 && (
          <>
            <ProfileForm profile={profile} onChange={handleProfileChange} />
          </>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <>
            <EducationForm
              educations={educations}
              onAdd={handleAddEducation}
              onUpdate={handleUpdateEducation}
              onDelete={handleDeleteEducation}
            />
          </>
        )}

        {/* Step 3: Experience */}
        {currentStep === 3 && (
          <>
            <ExperienceForm
              experiences={experience}
              onAdd={handleAddExperience}
              onUpdate={handleUpdateExperience}
              onDelete={handleDeleteExperience}
            />
          </>
        )}

        {/* Step 4: Skills */}
        {currentStep === 4 && (
          <>
            <SkillsForm
              skills={skills}
              onChange={onSkillsChange || (() => {})}
            />
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={isFirstStep() || isSubmitting}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous step"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            isSubmitting ||
            (currentStep === 1 && !isProfileValid(profile)) ||
            (currentStep === 2 && !areAllEducationsValid(educations)) ||
            (currentStep === 3 && !areAllExperiencesValid(experience)) ||
            (currentStep === 4 && (!areAllEducationsValid(educations) || !areAllExperiencesValid(experience) || !areSkillsValid(skills)))
          }
          className="px-6 py-3 bg-[#5A3FFF] text-white rounded-lg font-bold hover:bg-[#4a2fe0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          aria-label={isLastStep() ? "Complete resume" : "Go to next step"}
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            <>{isLastStep() ? "Submit" : "Next"}</>
          )}
        </button>
      </div>
    </div>
  );
}

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (field: keyof ProfileData, value: string) => void;
}

function ProfileForm({ profile, onChange }: ProfileFormProps): JSX.Element {
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="First"
          value={profile.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
            profile.firstName.trim() === "" ? "border-red-300" : "border-gray-300"
          }`}
          aria-label="First name"
        />
        <label className="block text-xs text-gray-600 mt-2">First name</label>
        {profile.firstName.trim() === "" && (
          <p className="text-xs text-red-500 mt-1">First name is required</p>
        )}
      </div>
      <div>
        <input
          type="text"
          placeholder="Last"
          value={profile.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
            profile.lastName.trim() === "" ? "border-red-300" : "border-gray-300"
          }`}
          aria-label="Last name"
        />
        <label className="block text-xs text-gray-600 mt-2">Last name</label>
        {profile.lastName.trim() === "" && (
          <p className="text-xs text-red-500 mt-1">Last name is required</p>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">🇳🇬 +234</span>
          <div className="flex-1">
            <input
              type="tel"
              placeholder="Phone number"
              value={profile.phoneNumber}
              onChange={(e) => onChange("phoneNumber", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                profile.phoneNumber.trim() === "" ? "border-red-300" : "border-gray-300"
              }`}
              aria-label="Phone number"
            />
            {profile.phoneNumber.trim() === "" && (
              <p className="text-xs text-red-500 mt-1">Phone number is required</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface EducationFormProps {
  educations: EducationData[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof EducationData, value: string) => void;
  onDelete: (index: number) => void;
}

function EducationForm({
  educations,
  onAdd,
  onUpdate,
  onDelete,
}: EducationFormProps): JSX.Element {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* List of Educations */}
      <div className="space-y-3">
        {educations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No education added yet. Click "Add Education" to get started.
          </p>
        ) : (
          educations.map((edu, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg overflow-hidden"
            >
              {/* Education Card Header */}
              <div className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="flex items-center gap-3 flex-1 text-left bg-transparent border-none cursor-pointer"
                >
                  <ChevronDown
                    size={18}
                    className={`text-gray-600 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {edu.nameOfSchool || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-600">{edu.certification || "No degree specified"}</p>
                  </div>
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Delete education"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Education Card Content */}
              {expandedIndex === index && (
                <div className="px-4 py-4 bg-white space-y-3 border-t border-gray-200">
                  <div>
                    <input
                      type="text"
                      placeholder="Name of school"
                      value={edu.nameOfSchool}
                      onChange={(e) =>
                        onUpdate(index, "nameOfSchool", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        edu.nameOfSchool.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="School name"
                    />
                    {edu.nameOfSchool.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">School name is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Field of study"
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        onUpdate(index, "fieldOfStudy", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        edu.fieldOfStudy.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Field of study"
                    />
                    {edu.fieldOfStudy.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Field of study is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Certification"
                      value={edu.certification}
                      onChange={(e) =>
                        onUpdate(index, "certification", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        edu.certification.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Certification or degree"
                    />
                    {edu.certification.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Certification is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => onUpdate(index, "year", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        edu.year.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Graduation year"
                    />
                    {edu.year.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Year is required</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Description"
                      value={edu.descriptionGraduation}
                      onChange={(e) =>
                        onUpdate(
                          index,
                          "descriptionGraduation",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 resize-none ${
                        edu.descriptionGraduation.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      rows={3}
                      aria-label="Education description"
                    />
                    {edu.descriptionGraduation.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Description is required</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Education Button */}
      <button
        onClick={onAdd}
        disabled={educations.length >= 9}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5A3FFF] hover:text-[#5A3FFF] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Add another education"
      >
        + Add Another Education ({educations.length}/9)
      </button>

      {/* Validation Messages */}
      {educations.length === 0 && (
        <p className="text-xs text-red-500">
          At least 1 education is required
        </p>
      )}
      {educations.length > 9 && (
        <p className="text-xs text-red-500">
          Maximum 9 educations allowed
        </p>
      )}
    </div>
  );
}

interface ExperienceFormProps {
  experiences: ExperienceData[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof ExperienceData, value: string) => void;
  onDelete: (index: number) => void;
}

function ExperienceForm({
  experiences,
  onAdd,
  onUpdate,
  onDelete,
}: ExperienceFormProps): JSX.Element {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* List of Experiences */}
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No experiences added yet. Click "Add Experience" to get started.
          </p>
        ) : (
          experiences.map((exp, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg overflow-hidden"
            >
              {/* Experience Card Header */}
              <div className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="flex items-center gap-3 flex-1 text-left bg-transparent border-none cursor-pointer"
                >
                  <ChevronDown
                    size={18}
                    className={`text-gray-600 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {exp.company || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-600">{exp.role || "No role specified"}</p>
                  </div>
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Delete experience"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Experience Card Content */}
              {expandedIndex === index && (
                <div className="px-4 py-4 bg-white space-y-3 border-t border-gray-200">
                  <div>
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) =>
                        onUpdate(index, "company", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        exp.company.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Company name"
                    />
                    {exp.company.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Company name is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Role"
                      value={exp.role}
                      onChange={(e) => onUpdate(index, "role", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        exp.role.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Job role"
                    />
                    {exp.role.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Role is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) =>
                        onUpdate(index, "location", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        exp.location.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Job location"
                    />
                    {exp.location.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Location is required</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Date"
                      value={exp.date}
                      onChange={(e) => onUpdate(index, "date", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 ${
                        exp.date.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      aria-label="Employment date"
                    />
                    {exp.date.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Date is required</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Description experience"
                      value={exp.descriptionExperience}
                      onChange={(e) =>
                        onUpdate(
                          index,
                          "descriptionExperience",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 resize-none ${
                        exp.descriptionExperience.trim() === "" ? "border-red-300" : "border-gray-300"
                      }`}
                      rows={3}
                      aria-label="Experience description"
                    />
                    {exp.descriptionExperience.trim() === "" && (
                      <p className="text-xs text-red-500 mt-1">Description is required</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Experience Button */}
      <button
        onClick={onAdd}
        disabled={experiences.length >= 9}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#5A3FFF] hover:text-[#5A3FFF] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Add another experience"
      >
        + Add Another Experience ({experiences.length}/9)
      </button>

      {/* Validation Messages */}
      {experiences.length === 0 && (
        <p className="text-xs text-red-500">
          At least 1 experience is required
        </p>
      )}
      {experiences.length > 9 && (
        <p className="text-xs text-red-500">
          Maximum 9 experiences allowed
        </p>
      )}
    </div>
  );
}

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

function SkillsForm({ skills, onChange }: SkillsFormProps): JSX.Element {
  const [inputValue, setInputValue] = React.useState("");

  const handleAddSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      onChange([...skills, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Field */}
      <div>
        <input
          type="text"
          placeholder="Type of skillset"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
          aria-label="Add skill"
        />
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200"
          >
            <span className="text-sm text-gray-700">{skill}</span>
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Button */}
        <button
          onClick={handleAddSkill}
          disabled={!inputValue.trim()}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 text-gray-500 hover:border-[#5A3FFF] hover:text-[#5A3FFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add skill"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
