"use client";

import React, { useState, JSX } from "react";
import { X } from "lucide-react";

interface ResumeFormProps {
  onNext?: () => void;
  onClose?: () => void;
}

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
  nameOfSchool2: string;
}

interface ExperienceData {
  company: string;
  role: string;
  location: string;
  date: string;
  descriptionExperience: string;
}

interface SkillData {
  skill: string;
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
  nameOfSchool2: "",
};

const INITIAL_EXPERIENCE: ExperienceData = {
  company: "",
  role: "",
  location: "",
  date: "",
  descriptionExperience: "",
};

const INITIAL_SKILLS: SkillData = {
  skill: "",
};

export default function ResumeForm({ onNext, onClose }: ResumeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [documentTitle, setDocumentTitle] = useState("");
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [education, setEducation] = useState<EducationData>(INITIAL_EDUCATION);
  const [experience, setExperience] =
    useState<ExperienceData>(INITIAL_EXPERIENCE);
  const [skills, setSkills] = useState<string[]>([
    "Interview",
    "Career",
    "Design",
  ]);

  const handleProfileChange = (
    field: keyof ProfileData,
    value: string
  ): void => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (
    field: keyof EducationData,
    value: string
  ): void => {
    setEducation((prev) => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (
    field: keyof ExperienceData,
    value: string
  ): void => {
    setExperience((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (field: keyof SkillData, value: string): void => {
    setSkills((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (): void => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext?.();
    }
  };

  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = (): number => {
    return (currentStep / 4) * 100;
  };

  const isFirstStep = (): boolean => currentStep === 1;
  const isLastStep = (): boolean => currentStep === 4;
  const currentStepConfig = STEP_CONFIG[currentStep];

  return (
    <div className="p-8">
      {/* Header with buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex gap-2">
            <button className="px-6 py-2 rounded-full font-bold text-sm bg-[#5A3FFF] text-white transition-colors">
              Publish
            </button>
            <button className="text-[#5A3FFF] text-sm font-medium hover:underline">
              Change template
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
          onChange={(e) => setDocumentTitle(e.target.value)}
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
              education={education}
              onChange={handleEducationChange}
            />
          </>
        )}

        {/* Step 3: Experience */}
        {currentStep === 3 && (
          <>
            <ExperienceForm
              experience={experience}
              onChange={handleExperienceChange}
            />
          </>
        )}

        {/* Step 4: Skills */}
        {currentStep === 4 && (
          <>
            <SkillsForm skills={skills} onChange={setSkills} />
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={isFirstStep()}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous step"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-[#5A3FFF] text-white rounded-lg font-bold hover:bg-[#4a2fe0] transition-colors"
          aria-label={isLastStep() ? "Complete resume" : "Go to next step"}
        >
          {isLastStep() ? "Next" : "Next"}
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="First name"
        />
        <label className="block text-xs text-gray-600 mt-2">First name</label>
      </div>
      <div>
        <input
          type="text"
          placeholder="Last"
          value={profile.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Last name"
        />
        <label className="block text-xs text-gray-600 mt-2">Last name</label>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">🇳🇬 +234</span>
          <input
            type="tel"
            placeholder="Phone number"
            value={profile.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
            aria-label="Phone number"
          />
        </div>
      </div>
    </>
  );
}

interface EducationFormProps {
  education: EducationData;
  onChange: (field: keyof EducationData, value: string) => void;
}

function EducationForm({
  education,
  onChange,
}: EducationFormProps): JSX.Element {
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Name of school"
          value={education.nameOfSchool}
          onChange={(e) => onChange("nameOfSchool", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="School name"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Field of study"
          value={education.fieldOfStudy}
          onChange={(e) => onChange("fieldOfStudy", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Field of study"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Certification"
          value={education.certification}
          onChange={(e) => onChange("certification", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Certification or degree"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Year"
          value={education.year}
          onChange={(e) => onChange("year", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Graduation year"
        />
      </div>
      <div>
        <textarea
          placeholder="Description (Gradation)"
          value={education.descriptionGraduation}
          onChange={(e) => onChange("descriptionGraduation", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 resize-none"
          rows={3}
          aria-label="Education description"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Name of school"
          value={education.nameOfSchool2}
          onChange={(e) => onChange("nameOfSchool2", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Additional school name"
        />
      </div>
    </>
  );
}

interface ExperienceFormProps {
  experience: ExperienceData;
  onChange: (field: keyof ExperienceData, value: string) => void;
}

function ExperienceForm({
  experience,
  onChange,
}: ExperienceFormProps): JSX.Element {
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Company"
          value={experience.company}
          onChange={(e) => onChange("company", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Company name"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Role"
          value={experience.role}
          onChange={(e) => onChange("role", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Job role"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Location"
          value={experience.location}
          onChange={(e) => onChange("location", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Job location"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Date"
          value={experience.date}
          onChange={(e) => onChange("date", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900"
          aria-label="Employment date"
        />
      </div>
      <div>
        <textarea
          placeholder="Description experience"
          value={experience.descriptionExperience}
          onChange={(e) => onChange("descriptionExperience", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-gray-900 resize-none"
          rows={3}
          aria-label="Experience description"
        />
      </div>
    </>
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
