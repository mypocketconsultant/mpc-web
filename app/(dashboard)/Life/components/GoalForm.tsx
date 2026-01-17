"use client";

import { X, Plus, Trash2 } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  due_date: string;
}

interface GoalFormProps {
  goalTitle: string;
  horizon: string;
  domains: string[];
  steps: Step[];
  onGoalTitleChange: (title: string) => void;
  onHorizonChange: (horizon: string) => void;
  onDomainsChange: (domains: string[]) => void;
  onStepsChange: (steps: Step[]) => void;
  onPublish: () => void;
  onClose: () => void;
  isPublishing?: boolean;
}

const DOMAIN_OPTIONS = ["health", "career", "relationships", "finance", "personal growth", "education"];

export default function GoalForm({
  goalTitle,
  horizon,
  domains,
  steps,
  onGoalTitleChange,
  onHorizonChange,
  onDomainsChange,
  onStepsChange,
  onPublish,
  onClose,
  isPublishing = false,
}: GoalFormProps) {
  const toggleDomain = (domain: string) => {
    if (domains.includes(domain)) {
      onDomainsChange(domains.filter(d => d !== domain));
    } else {
      onDomainsChange([...domains, domain]);
    }
  };

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: "",
      description: "",
      due_date: "",
    };
    onStepsChange([...steps, newStep]);
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    onStepsChange(steps.map(step =>
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const removeStep = (id: string) => {
    onStepsChange(steps.filter(step => step.id !== id));
  };
  return (
    <div className="w-full  ">
      {/* Header */}
      <div className="flex items-center justify-between p-6  border-gray-100">
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="px-5 py-2 bg-[#5A3FFF] text-white text-sm font-semibold rounded-full hover:bg-[#4A2FEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Goal Title */}
        <div>
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => onGoalTitleChange(e.target.value)}
            placeholder="Add goal title"
            className="w-full text-2xl font-medium text-gray-900 placeholder:text-gray-300 border-none outline-none focus:ring-0"
          />
        </div>

        {/* Horizon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time horizon</label>
          <input
            type="text"
            value={horizon}
            onChange={(e) => onHorizonChange(e.target.value)}
            placeholder="e.g., 3 months, 6 weeks, 1 year"
            className="w-full px-4 py-2 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
          />
        </div>

        {/* Domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Focus areas</label>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map(domain => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  domains.includes(domain)
                    ? 'bg-[#5A3FFF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Steps</label>
            <button
              onClick={addStep}
              className="flex items-center gap-1 text-xs text-[#5A3FFF] hover:text-[#4A2FEF] font-medium"
            >
              <Plus className="w-4 h-4" />
              Add step
            </button>
          </div>

          <div className="space-y-3">
            {steps.map(step => (
              <div key={step.id} className="p-4 border border-gray-200 rounded-2xl space-y-3">
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                  placeholder="Step title"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
                />
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
                  rows={2}
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={step.due_date}
                    onChange={(e) => updateStep(step.id, 'due_date', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
                  />
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
