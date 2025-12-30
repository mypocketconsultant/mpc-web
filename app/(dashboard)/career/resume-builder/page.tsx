'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Header from '@/app/components/header';
import AIEditSidebar from '../components/AIEditSidebar';
import ResumeForm from '../components/ResumeForm';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'resume' | 'loading';
  content: string;
  fullContent?: string;
  file?: {
    name: string;
    size: string;
  };
  resumeData?: {
    title: string;
    resumeId: string;
    pdfUrl: string;
  };
  analysisPlan?: any;
  isExpanded?: boolean;
  isError?: boolean;
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
}

interface ExperienceData {
  company: string;
  role: string;
  location: string;
  date: string;
  descriptionExperience: string;
}

export default function ResumeBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [resetFormTrigger, setResetFormTrigger] = useState<number | undefined>();
  const [initialFormData, setInitialFormData] = useState<any>(undefined);

  // Form state lifted from ResumeForm
  const [documentTitle, setDocumentTitle] = useState('');
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [educations, setEducations] = useState<EducationData[]>([]);
  const [experience, setExperience] = useState<ExperienceData[]>([]);
  const [skills, setSkills] = useState<string[]>(['Interview', 'Career', 'Design']);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(null);
  const [expandedEducationIndex, setExpandedEducationIndex] = useState<number | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [selectedEducationIndex, setSelectedEducationIndex] = useState<number | null>(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<number | null>(null);

  // Initialize resumeId from localStorage on mount
  useEffect(() => {
    const savedResumeId = localStorage.getItem('currentResumeId');
    if (savedResumeId) {
      setResumeId(savedResumeId);
    }
  }, []);

  // Save resumeId to localStorage whenever it changes
  useEffect(() => {
    if (resumeId) {
      localStorage.setItem('currentResumeId', resumeId);
    }
  }, [resumeId]);

  // Handle new resume - reset all state
  const handleNewResume = () => {
    // Clear localStorage
    localStorage.removeItem('currentResumeId');

    // Reset all form state
    setResumeId(null);
    setDocumentTitle('');
    setProfile({ firstName: '', lastName: '', phoneNumber: '' });
    setEducations([]);
    setExperience([]);
    setSkills([]);
    setCurrentStep(1);
    setExpandedSectionIndex(null);
    setExpandedEducationIndex(null);
    setTargetRole('');
    setSelectedEducationIndex(null);
    setSelectedExperienceIndex(null);

    // Clear AI chat messages
    setMessages([]);
  };

  // Fetch chat history and form data
  const fetchChatHistory = async (id?: string) => {
    const fetchResumeId = id || resumeId;
    if (!fetchResumeId) return;

    try {
      console.log('[ResumeBuilder] Fetching chat history and form data for resumeId:', fetchResumeId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/${fetchResumeId}/chat-history`,
        { withCredentials: true }
      );

      if (response.data?.data?.messages) {
        console.log('[ResumeBuilder] Chat history loaded, messages count:', response.data.data.messages.length);

        // Log full AI responses
        response.data.data.messages.forEach((msg: any, idx: number) => {
          if (msg.type === 'assistant' && msg.analysisPlan) {
            console.log(`[ResumeBuilder] Message ${idx} - Full AI Response with Analysis Plan:`, {
              id: msg.id,
              content: msg.content,
              analysisPlan: msg.analysisPlan
            });
          } else if (msg.type === 'assistant') {
            console.log(`[ResumeBuilder] Message ${idx} - Full AI Response (No Plan):`, {
              id: msg.id,
              content: msg.content
            });
          }
        });

        setMessages(response.data.data.messages);
      }

      if (response.data?.data?.formData) {
        console.log('[ResumeBuilder] Form data loaded', {
          documentTitle: response.data.data.formData.documentTitle,
          profileFields: Object.keys(response.data.data.formData.profile || {}),
          educationCount: response.data.data.formData.educations?.length,
          experienceCount: response.data.data.formData.experience?.length,
          skillsCount: response.data.data.formData.skills?.length,
        });
        setInitialFormData(response.data.data.formData);
        // Populate form state from loaded data
        const formData = response.data.data.formData;
        if (formData.documentTitle) setDocumentTitle(formData.documentTitle);
        if (formData.profile) setProfile(formData.profile);
        if (formData.educations) setEducations(formData.educations);
        if (formData.experience) setExperience(formData.experience);
        if (formData.skills) setSkills(formData.skills);
      }
    } catch (error) {
      console.error('[ResumeBuilder] Error fetching chat history:', error);
      // Silently fail - no chat history is fine
    }
  };

  // Fetch chat history and form data when resumeId is available
  useEffect(() => {
    fetchChatHistory();
  }, [resumeId]);

  const getTitleFromPath = (path: string) => {
    if (path.includes('/resume-builder')) return 'Resume Builder';
    if (path.includes('/career')) return 'Career Advisory';
    return 'My Pocket Consultant';
  };

  const toggleMessageExpanded = (messageId: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const fullContent = msg.fullContent || msg.content;
        return {
          ...msg,
          isExpanded: !msg.isExpanded,
          content: msg.isExpanded ? (fullContent.substring(0, 200) + '...') : fullContent
        };
      }
      return msg;
    }));
  };

  const handleNext = (newResumeId: string, resumeData: any, responseData: any) => {
    console.log('Resume completed', newResumeId, resumeData, responseData);
    setResumeId(newResumeId);

    // Use the messages from the API response (properly formatted from database)
    if (responseData?.messages) {
      console.log('[ResumeBuilder] Setting messages from API response:', responseData.messages.length, 'messages');
      setMessages(responseData.messages);
    }

    // Trigger form reset to step 1 while keeping all data
    setResetFormTrigger(Date.now());
    console.log('[ResumeBuilder] Triggered form reset to step 1');
  };

  const handleSend = async (message: string, mode: 'chat' | 'edit' = 'chat', sectionName?: string) => {
    console.log('[ResumeBuilder] handleSend called with message:', message, 'mode:', mode);

    if (!resumeId) {
      console.error('[ResumeBuilder] Error: No resume ID available');
      return;
    }

    console.log('[ResumeBuilder] Stage 1: Resume ID confirmed:', resumeId);

    // Add user message to UI immediately
    const newUserMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message
    };

    // Add loading bubble
    const loadingBubbleId = (Date.now() + 1).toString();
    const loadingBubble = {
      id: loadingBubbleId,
      type: 'loading' as const,
      content: ''
    };

    console.log('[ResumeBuilder] Stage 2: Adding user message and loading bubble to UI');
    setMessages([...messages, newUserMessage, loadingBubble]);
    setInputValue('');

    try {
      let apiUrl: string;
      let payload: any;

      if (mode === 'edit' && sectionName) {
        // Edit mode: call /v1/agent/career/resume/edit
        console.log('[ResumeBuilder] Stage 3: Edit mode - extracting bullets from section:', sectionName);

        let bullets: string[] = [];
        let sectionContext: string | undefined;

        if (sectionName.toLowerCase() === 'experience') {
          // Use selected experience item or first item
          const selectedIdx = selectedExperienceIndex ?? 0;
          if (selectedIdx < experience.length) {
            const exp = experience[selectedIdx];
            bullets = [exp.descriptionExperience].filter(Boolean);
            sectionContext = `Company: ${exp.company} | Role: ${exp.role} | Location: ${exp.location} | Date: ${exp.date} | Description: ${exp.descriptionExperience}`;
            console.log('[ResumeBuilder] Stage 3.1: Using experience entry at index:', selectedIdx);
          }
        } else if (sectionName.toLowerCase() === 'skills') {
          bullets = skills;
          sectionContext = `Skills: ${skills.join(', ')}`;
        } else if (sectionName.toLowerCase() === 'education') {
          // Use selected education item or first item
          const selectedIdx = selectedEducationIndex ?? 0;
          if (selectedIdx < educations.length) {
            const edu = educations[selectedIdx];
            bullets = [edu.descriptionGraduation].filter(Boolean);
            sectionContext = `School: ${edu.nameOfSchool} | Field of Study: ${edu.fieldOfStudy} | Certification: ${edu.certification} | Year: ${edu.year} | Description: ${edu.descriptionGraduation}`;
            console.log('[ResumeBuilder] Stage 3.1: Using education entry at index:', selectedIdx);
          }
        }

        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/edit`;
        payload = {
          resumeId,
          targetRole: targetRole || 'Not specified',
          sectionName,
          bullets,
          sectionContext,
          extraNotes: message
        };
        console.log('[ResumeBuilder] Stage 3: Edit mode payload:', payload);
      } else {
        // Chat mode: call /v1/resume-builder/chat
        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/chat`;
        payload = {
          resumeId,
          message
        };
        console.log('[ResumeBuilder] Stage 3: Chat mode payload:', payload);
      }

      console.log('[ResumeBuilder] Stage 4: Making POST request to:', apiUrl);
      console.log('[ResumeBuilder] Stage 4.1: Full payload being sent:', JSON.stringify(payload, null, 2));

      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });

      console.log('[ResumeBuilder] Stage 5: API response received:', response.data);

      // Use the full messages array from the API response
      if (response.data?.data?.messages && Array.isArray(response.data.data.messages)) {
        console.log('[ResumeBuilder] Stage 6: Replacing loading bubble with full messages array');
        console.log('[ResumeBuilder] Total messages from API:', response.data.data.messages.length);

        setMessages(response.data.data.messages);
      } else if (response.data?.data?.message) {
        console.log('[ResumeBuilder] Stage 6: Falling back to single message response');
        console.log('[ResumeBuilder] AI Response:', response.data.data.message);

        setMessages(prev => prev.map(msg =>
          msg.id === loadingBubbleId
            ? {
                id: msg.id,
                type: 'assistant',
                content: response.data.data.message
              }
            : msg
        ));
      } else {
        console.warn('[ResumeBuilder] Stage 6: No message or messages in API response');
      }

      // If edit mode, update form data with the response
      if (mode === 'edit') {
        console.log('[ResumeBuilder] Stage 7: Edit successful, updating form data from response');
        if (response.data?.data?.formData) {
          const updatedFormData = response.data.data.formData;
          console.log('[ResumeBuilder] Stage 7.5: Form data received from API:', {
            documentTitle: updatedFormData.documentTitle,
            educationCount: updatedFormData.educations?.length,
            experienceCount: updatedFormData.experience?.length,
            skillsCount: updatedFormData.skills?.length,
          });

          // Update form state with the edited resume data
          if (updatedFormData.documentTitle) setDocumentTitle(updatedFormData.documentTitle);
          if (updatedFormData.profile) setProfile(updatedFormData.profile);
          if (updatedFormData.educations) setEducations(updatedFormData.educations);
          if (updatedFormData.experience) setExperience(updatedFormData.experience);
          if (updatedFormData.skills) setSkills(updatedFormData.skills);

          console.log('[ResumeBuilder] Stage 7.6: Form state updated with API response');
        } else {
          // Fallback to fetching chat history if formData is not in response
          console.log('[ResumeBuilder] Stage 7.5: No formData in response, refetching via chat history');
          await fetchChatHistory();
        }
      }
    } catch (error) {
      console.error('[ResumeBuilder] Stage 5: Error during API call:', error);
      if (axios.isAxiosError(error)) {
        console.error('[ResumeBuilder] Error response status:', error.response?.status);
        console.error('[ResumeBuilder] Error response data:', error.response?.data);
        console.error('[ResumeBuilder] Error message:', error.message);
      }

      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'AI could not respond to this. Please try again.';

      console.log('[ResumeBuilder] Stage 6: Replacing loading bubble with error message:', errorMessage);

      setMessages(prev => prev.map(msg =>
        msg.id === loadingBubbleId
          ? {
              id: msg.id,
              type: 'assistant',
              content: errorMessage,
              isError: true
            }
          : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Resume Builder
          </Link>

          <hr className="my-10" />

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Edit with AI */}
            <div className="col-span-5 sticky top-10 h-fit">
              <AIEditSidebar
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onToggleExpanded={toggleMessageExpanded}
                resumeId={resumeId || ''}
                currentExperience={experience}
                currentSkills={skills}
                currentEducations={educations}
                targetRole={targetRole}
                onTargetRoleChange={setTargetRole}
                expandedEducationIndex={expandedEducationIndex}
                expandedSectionIndex={expandedSectionIndex}
                selectedEducationIndex={selectedEducationIndex}
                onSelectedEducationIndexChange={setSelectedEducationIndex}
                selectedExperienceIndex={selectedExperienceIndex}
                onSelectedExperienceIndexChange={setSelectedExperienceIndex}
              />
            </div>

            {/* Right Side - Form */}
            <div className="col-span-7">
              <ResumeForm
                onNext={handleNext}
                onClose={() => router.back()}
                resetTrigger={resetFormTrigger}
                // Lift form state as props
                documentTitle={documentTitle}
                onDocumentTitleChange={setDocumentTitle}
                profile={profile}
                onProfileChange={(field, value) => setProfile(prev => ({ ...prev, [field]: value }))}
                educations={educations}
                onAddEducation={() => setEducations(prev => [...prev, {
                  nameOfSchool: '',
                  fieldOfStudy: '',
                  certification: '',
                  year: '',
                  descriptionGraduation: ''
                }])}
                onUpdateEducation={(index, field, value) => setEducations(prev =>
                  prev.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
                )}
                onDeleteEducation={(index) => setEducations(prev => prev.filter((_, i) => i !== index))}
                expandedEducationIndex={expandedEducationIndex}
                onEducationExpand={setExpandedEducationIndex}
                experience={experience}
                onAddExperience={() => setExperience(prev => [...prev, {
                  company: '',
                  role: '',
                  location: '',
                  date: '',
                  descriptionExperience: ''
                }])}
                onUpdateExperience={(index, field, value) => setExperience(prev =>
                  prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
                )}
                onDeleteExperience={(index) => setExperience(prev => prev.filter((_, i) => i !== index))}
                expandedSectionIndex={expandedSectionIndex}
                onExperienceExpand={setExpandedSectionIndex}
                skills={skills}
                onSkillsChange={setSkills}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onNewResume={handleNewResume}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
