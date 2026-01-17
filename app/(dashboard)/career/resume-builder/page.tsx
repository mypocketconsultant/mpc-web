'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Header from '@/app/components/header';
import AIEditSidebar from '../components/AIEditSidebar';
import ResumeForm from '../components/ResumeForm';
import ResumeTemplateSelector from '../components/ResumeTemplateSelector';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [resetFormTrigger, setResetFormTrigger] = useState<number | undefined>();

  // Processing state for uploaded resume
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [processingUploadId, setProcessingUploadId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Loading state for session fetch
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // PDF modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Initialize resumeId and processing state from sessionStorage on mount
  useEffect(() => {
    const savedResumeId = sessionStorage.getItem('currentResumeId');
    if (savedResumeId) {
      setResumeId(savedResumeId);
    }

    // Restore processing state if page was reloaded during upload
    const savedUploadId = sessionStorage.getItem('processingUploadId');
    if (savedUploadId) {
      console.log('[ResumeBuilder] Restoring processing state for uploadId:', savedUploadId);
      setProcessingUploadId(savedUploadId);
      setIsProcessingResume(true);
    }
  }, []);

  // Save resumeId to sessionStorage whenever it changes
  useEffect(() => {
    if (resumeId) {
      sessionStorage.setItem('currentResumeId', resumeId);
    }
  }, [resumeId]);

  // Save processing state to sessionStorage whenever it changes
  useEffect(() => {
    if (isProcessingResume && processingUploadId) {
      console.log('[ResumeBuilder] Saving processing state to sessionStorage:', processingUploadId);
      sessionStorage.setItem('processingUploadId', processingUploadId);
    } else if (!isProcessingResume) {
      // Clear processing state when complete
      console.log('[ResumeBuilder] Clearing processing state from sessionStorage');
      sessionStorage.removeItem('processingUploadId');
    }
  }, [isProcessingResume, processingUploadId]);

  // Poll for upload status
  const pollUploadStatus = useCallback(async (uploadId: string) => {
    try {
      console.log('[ResumeBuilder] Polling upload status for:', uploadId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/upload/status/${uploadId}`,
        { withCredentials: true }
      );

      console.log('[ResumeBuilder] Poll response:', response.data);

      const { status, error, resumeId: parsedDocId } = response.data?.data || {};

      if (status === 'parsed') {
        console.log('[ResumeBuilder] Resume parsing complete, stopping polling');
        console.log('[ResumeBuilder] parsed_doc_id (resumeId):', parsedDocId);

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProcessingResume(false);
        setProcessingUploadId(null);

        // NOW set the resumeId to the parsed document ID
        // This is the MongoDB document ID that should be used for all subsequent calls
        if (parsedDocId) {
          setResumeId(parsedDocId);
          sessionStorage.setItem('currentResumeId', parsedDocId);
          console.log('[ResumeBuilder] Set resumeId to parsed_doc_id:', parsedDocId);
        }

        // Add success message
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'Resume parsed successfully! Use the chat to get started or review the parsed content.',
        };
        setMessages(prev => [...prev, successMessage]);

        // fetchChatHistory will be triggered by useEffect when resumeId changes

      } else if (status === 'failed') {
        console.error('[ResumeBuilder] Resume parsing failed:', error);

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProcessingResume(false);
        setProcessingUploadId(null);

        // Add error message
        const errorMsg: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Failed to parse resume: ${error || 'Unknown error'}. Please try uploading again.`,
          isError: true,
        };
        setMessages(prev => [...prev, errorMsg]);
      }
      // If still processing (uploaded/parsing), keep polling
    } catch (err) {
      console.error('[ResumeBuilder] Error polling upload status:', err);
    }
  }, []);

  // Start polling when processingUploadId is set
  useEffect(() => {
    if (processingUploadId && isProcessingResume) {
      console.log('[ResumeBuilder] Starting polling for uploadId:', processingUploadId);

      // Poll immediately
      pollUploadStatus(processingUploadId);

      // Then poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollUploadStatus(processingUploadId);
      }, 2000);

      // Cleanup on unmount or when polling stops
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [processingUploadId, isProcessingResume, pollUploadStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle new resume - reset all state
  const handleNewResume = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('currentResumeId');

    // Stop any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsProcessingResume(false);
    setProcessingUploadId(null);

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

  // Handle download resume - open PDF modal
  const handleDownloadResume = () => {
    setIsPdfModalOpen(true);
  };

  // Fetch chat history and form data
  const fetchChatHistory = useCallback(async (id?: string) => {
    const fetchResumeId = id || resumeId;
    console.log(fetchResumeId, 'fetchresumid')
    if (!fetchResumeId) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoadingSession(true);

    try {
      console.log('[ResumeBuilder] Fetching chat history and form data for resumeId:', fetchResumeId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/${fetchResumeId}/session`,
        {
          withCredentials: true,
          signal
        }
      );

      if (signal.aborted) {
        console.log('[ResumeBuilder] Fetch cancelled');
        return;
      }

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
        // Populate form state from loaded data
        const formData = response.data.data.formData;
        if (formData.documentTitle) setDocumentTitle(formData.documentTitle);
        if (formData.profile) setProfile(formData.profile);
        if (formData.educations) setEducations(formData.educations);
        if (formData.experience) setExperience(formData.experience);
        if (formData.skills) setSkills(formData.skills);
      }

      setIsLoadingSession(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('[ResumeBuilder] Session fetch cancelled');
      } else {
        console.error('[ResumeBuilder] Error fetching chat history:', error);
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to load resume session. Please try again.';

        // Add error message to chat
        const errorMsg: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: errorMessage,
          isError: true,
        };
        setMessages(prev => [...prev, errorMsg]);
      }
      setIsLoadingSession(false);
    }
  }, [resumeId]);

  // Fetch chat history and form data when resumeId is available
  useEffect(() => {
    if (resumeId) {
      fetchChatHistory();
    }

    // Cleanup: abort request if component unmounts or resumeId changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [resumeId, fetchChatHistory]);

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

    // Populate form state from the response's formData (sections parsed back to form format)
    if (responseData?.formData) {
      console.log('[ResumeBuilder] Populating form with formData from API response:', {
        documentTitle: responseData.formData.documentTitle,
        educationCount: responseData.formData.educations?.length,
        experienceCount: responseData.formData.experience?.length,
        skillsCount: responseData.formData.skills?.length,
      });
      if (responseData.formData.documentTitle) setDocumentTitle(responseData.formData.documentTitle);
      if (responseData.formData.profile) setProfile(responseData.formData.profile);
      if (responseData.formData.educations) setEducations(responseData.formData.educations);
      if (responseData.formData.experience) setExperience(responseData.formData.experience);
      if (responseData.formData.skills) setSkills(responseData.formData.skills);
    }

    // Trigger form reset to step 1 while keeping all data
    setResetFormTrigger(Date.now());
    console.log('[ResumeBuilder] Triggered form reset to step 1');
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    console.log('[ResumeBuilder] handleFileUpload called with file:', file.name);

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('[ResumeBuilder] Invalid file type:', file.type);
      throw new Error('Only PDF files are supported');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[ResumeBuilder] Uploading file to mpc-api...');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('[ResumeBuilder] Upload response:', response.data);

      const { resumeId: uploadId } = response.data?.data || {};

      if (uploadId) {
        // Add a message to indicate upload success
        const uploadMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Resume "${file.name}" uploaded successfully! Analyzing your resume...`,
        };
        setMessages(prev => [...prev, uploadMessage]);

        // Start processing state and polling - DO NOT set resumeId yet
        // We wait for parsing to complete and use parsed_doc_id as resumeId
        console.log('[ResumeBuilder] Starting processing state with uploadId:', uploadId);
        setIsProcessingResume(true);
        setProcessingUploadId(uploadId);

        console.log('[ResumeBuilder] Resume uploaded, upload_id:', uploadId);
      }
    } catch (error) {
      console.error('[ResumeBuilder] Upload error:', error);

      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to upload resume. Please try again.';

      // Add error message
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: errorMessage,
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);

      throw error;
    }
  };

  const handleSend = async (message: string) => {
    console.log('[ResumeBuilder] handleSend called with message:', message);

    if (!resumeId) {
      console.error('[ResumeBuilder] Error: No resume ID available');
      return;
    }

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

    console.log('[ResumeBuilder] Adding user message and loading bubble to UI');
    setMessages([...messages, newUserMessage, loadingBubble]);
    setInputValue('');

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/chat`;
      const payload = {
        resumeId,
        message
      };

      console.log('[ResumeBuilder] Making POST request to:', apiUrl);
      console.log('[ResumeBuilder] Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });

      console.log('[ResumeBuilder] API response received:', response.data);

      // Use the full messages array from the API response
      if (response.data?.data?.messages && Array.isArray(response.data.data.messages)) {
        console.log('[ResumeBuilder] Setting messages from API response:', response.data.data.messages.length);
        setMessages(response.data.data.messages);
      } else if (response.data?.data?.message) {
        console.log('[ResumeBuilder] Falling back to single message response');
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
        console.warn('[ResumeBuilder] No message or messages in API response');
      }
    } catch (error) {
      console.error('[ResumeBuilder] Error during API call:', error);
      if (axios.isAxiosError(error)) {
        console.error('[ResumeBuilder] Error response status:', error.response?.status);
        console.error('[ResumeBuilder] Error response data:', error.response?.data);
      }

      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'AI could not respond to this. Please try again.';

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
      <main className="flex-1 overflow-auto scrollbar-hide relative">
        {/* Loading Overlay - Scoped to Main Content Area */}
        {(isProcessingResume || (isLoadingSession && resumeId)) && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999] rounded-lg">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg">
              <div className="w-12 h-12 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{isProcessingResume ? 'Analyzing your resume' : 'Loading resume data'}</p>
                <p className="text-sm text-gray-500 mt-1">{isProcessingResume ? 'This usually takes 10-30 seconds' : 'Please wait...'}</p>
              </div>
            </div>
          </div>
        )}

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
                onFileUpload={handleFileUpload}
                intent="resume-builder"
                emptyStateMessage="Upload your resume or ask me to help optimize and improve it..."
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
                resumeId={resumeId}
                onDownloadResume={handleDownloadResume}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Resume Template Selector Modal */}
      {resumeId && (
        <ResumeTemplateSelector
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          resumeId={resumeId}
          resumeTitle={documentTitle}
          profile={profile}
          educations={educations}
          experience={experience}
          skills={skills}
        />
      )}
    </div>
  );
}
