'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Download, Edit3, Check, X, Plus } from 'lucide-react';
import axios from 'axios';
import Header from '@/app/components/header';
import AIEditSidebar from '../components/AIEditSidebar';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/Toast';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'resume' | 'loading';
  content: string;
  fullContent?: string;
  file?: { name: string; size: string };
  resumeData?: { title: string; resumeId: string; pdfUrl: string };
  analysisPlan?: any;
  isExpanded?: boolean;
  isError?: boolean;
}

interface CVSection {
  name: string;
  content: string;
}

interface CVDocument {
  id: string;
  user_id: string;
  type: string;
  title: string;
  sections: CVSection[];
  content_text: string;
  format: string;
  meta: Record<string, any>;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

type DocKind = 'cv' | 'cover_letter';
type CountryStyle = 'UK' | 'US' | 'NG' | 'CA' | 'AU' | 'EU';
type ToneOption = 'professional' | 'friendly' | 'bold' | 'formal' | 'warm' | 'confident';

export default function CVBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast, showToast } = useToast();

  // Core state
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvDocument, setCvDocument] = useState<CVDocument | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Resume upload state (for using existing resume as context)
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [processingUploadId, setProcessingUploadId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form options for initial build
  const [docKind, setDocKind] = useState<DocKind>('cv');
  const [targetRole, setTargetRole] = useState('');
  const [country, setCountry] = useState<CountryStyle>('UK');
  const [seniority, setSeniority] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState<ToneOption | ''>('');

  // Section editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Abort controller for fetch cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTitleFromPath = (path: string) => {
    if (path.includes('/cv-builder')) return 'CV Builder';
    if (path.includes('/career')) return 'Career Advisory';
    return 'My Pocket Consultant';
  };

  const toggleMessageExpanded = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const fullContent = msg.fullContent || msg.content;
          return {
            ...msg,
            isExpanded: !msg.isExpanded,
            content: msg.isExpanded
              ? fullContent.substring(0, 200) + '...'
              : fullContent,
          };
        }
        return msg;
      })
    );
  };

  /**
   * Initialize cvId and upload state from sessionStorage on mount
   */
  useEffect(() => {
    const savedCvId = sessionStorage.getItem('currentCvId');
    if (savedCvId) {
      setCvId(savedCvId);
    }

    // Restore uploaded resume ID
    const savedResumeId = sessionStorage.getItem('uploadedResumeId');
    if (savedResumeId) {
      setUploadedResumeId(savedResumeId);
    }

    // Restore processing state if page was reloaded during upload
    const savedUploadId = sessionStorage.getItem('processingUploadId');
    if (savedUploadId) {
      console.log('[CVBuilder] Restoring processing state for uploadId:', savedUploadId);
      setProcessingUploadId(savedUploadId);
      setIsProcessingUpload(true);
    }
  }, []);

  /**
   * Save cvId to sessionStorage whenever it changes
   */
  useEffect(() => {
    if (cvId) {
      sessionStorage.setItem('currentCvId', cvId);
    }
  }, [cvId]);

  /**
   * Fetch CV session data (document + chat messages) when cvId is available
   */
  const fetchCVSession = useCallback(async (id?: string) => {
    const fetchCvId = id || cvId;
    if (!fetchCvId) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoadingSession(true);

    try {
      console.log('[CVBuilder] Fetching CV session for cvId:', fetchCvId);

      // Fetch the CV document
      const docResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/${fetchCvId}`,
        { withCredentials: true, signal }
      );

      if (signal.aborted) {
        console.log('[CVBuilder] Fetch cancelled');
        return;
      }

      if (docResponse.data?.data) {
        console.log('[CVBuilder] CV document loaded:', docResponse.data.data.title);
        setCvDocument(docResponse.data.data);

        // Set docKind from loaded document
        if (docResponse.data.data.type === 'cover') {
          setDocKind('cover_letter');
        } else {
          setDocKind('cv');
        }
      }

      // Note: We don't fetch conversation messages here because the CV builder
      // uses the career agent which stores conversations by resume_id, not by CV doc_id.
      // Chat messages will be populated when the user sends a message.

      setIsLoadingSession(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('[CVBuilder] Session fetch cancelled');
      } else {
        console.error('[CVBuilder] Error fetching CV session:', error);
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to load CV session. Please try again.';

        showToast('error', errorMessage);
      }
      setIsLoadingSession(false);
    }
  }, [cvId, showToast]);

  /**
   * Load CV session when cvId is available
   */
  useEffect(() => {
    if (cvId) {
      fetchCVSession();
    }

    // Cleanup: abort request if component unmounts or cvId changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cvId, fetchCVSession]);

  /**
   * Save uploadedResumeId to sessionStorage whenever it changes
   */
  useEffect(() => {
    if (uploadedResumeId) {
      sessionStorage.setItem('uploadedResumeId', uploadedResumeId);
    }
  }, [uploadedResumeId]);

  /**
   * Save processing state to sessionStorage whenever it changes
   */
  useEffect(() => {
    if (isProcessingUpload && processingUploadId) {
      console.log('[CVBuilder] Saving processing state to sessionStorage:', processingUploadId);
      sessionStorage.setItem('processingUploadId', processingUploadId);
    } else if (!isProcessingUpload) {
      console.log('[CVBuilder] Clearing processing state from sessionStorage');
      sessionStorage.removeItem('processingUploadId');
    }
  }, [isProcessingUpload, processingUploadId]);

  /**
   * Poll for upload status
   */
  const pollUploadStatus = useCallback(async (uploadId: string) => {
    try {
      console.log('[CVBuilder] Polling upload status for:', uploadId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/upload/status/${uploadId}`,
        { withCredentials: true }
      );

      console.log('[CVBuilder] Poll response:', response.data);

      const { status, error, resumeId: parsedDocId } = response.data?.data || {};

      if (status === 'parsed') {
        console.log('[CVBuilder] Resume parsing complete, stopping polling');
        console.log('[CVBuilder] parsed_doc_id (resumeId):', parsedDocId);

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProcessingUpload(false);
        setProcessingUploadId(null);

        // Store the parsed resume ID for use as context
        if (parsedDocId) {
          setUploadedResumeId(parsedDocId);
          sessionStorage.setItem('uploadedResumeId', parsedDocId);
          console.log('[CVBuilder] Set uploadedResumeId to parsed_doc_id:', parsedDocId);
        }

        // Add success message
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'Resume uploaded successfully! Now tell me about the role you want to apply for and I\'ll build a tailored CV using your resume as reference.',
        };
        setMessages(prev => [...prev, successMessage]);

      } else if (status === 'failed') {
        console.error('[CVBuilder] Resume parsing failed:', error);

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProcessingUpload(false);
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
      console.error('[CVBuilder] Error polling upload status:', err);
    }
  }, []);

  /**
   * Start polling when processingUploadId is set
   */
  useEffect(() => {
    if (processingUploadId && isProcessingUpload) {
      console.log('[CVBuilder] Starting polling for uploadId:', processingUploadId);

      // Poll immediately
      pollUploadStatus(processingUploadId);

      // Then poll every 6 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollUploadStatus(processingUploadId);
      }, 6000);

      // Cleanup on unmount or when polling stops
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [processingUploadId, isProcessingUpload, pollUploadStatus]);

  /**
   * Cleanup polling on unmount
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Clear session and start a new CV
   */
  const handleNewCV = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('currentCvId');
    sessionStorage.removeItem('uploadedResumeId');
    sessionStorage.removeItem('processingUploadId');

    // Stop any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Reset all state
    setCvId(null);
    setCvDocument(null);
    setMessages([]);
    setInputValue('');
    setUploadedResumeId(null);
    setIsProcessingUpload(false);
    setProcessingUploadId(null);
    setDocKind('cv');
    setTargetRole('');
    setCountry('UK');
    setSeniority('');
    setIndustry('');
    setTone('');
    setEditingIndex(null);
    setEditContent('');

    showToast('success', 'Ready to create a new CV!');
  };

  /**
   * Handle file upload (resume PDF).
   * Uploads to backend, which parses it and stores as a resume document.
   * The parsed resume ID will be used as context when building the CV.
   */
  const handleFileUpload = async (file: File): Promise<void> => {
    console.log('[CVBuilder] handleFileUpload called with file:', file.name);

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('[CVBuilder] Invalid file type:', file.type);
      throw new Error('Only PDF files are supported');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[CVBuilder] Uploading file to mpc-api...');

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

      console.log('[CVBuilder] Upload response:', response.data);

      const { resumeId: uploadId } = response.data?.data || {};

      if (uploadId) {
        // Add a message to indicate upload success
        const uploadMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Resume "${file.name}" uploaded successfully! Analyzing your resume...`,
        };
        setMessages(prev => [...prev, uploadMessage]);

        // Start processing state and polling
        console.log('[CVBuilder] Starting processing state with uploadId:', uploadId);
        setIsProcessingUpload(true);
        setProcessingUploadId(uploadId);

        console.log('[CVBuilder] Resume uploaded, upload_id:', uploadId);
      }
    } catch (error) {
      console.error('[CVBuilder] Upload error:', error);

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

  /**
   * Build a new CV from scratch.
   * Calls POST /v1/cv-builder/build
   */
  const handleBuild = useCallback(
    async (message: string) => {
      // Add user message to UI
      const userMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
      };

      const loadingId = (Date.now() + 1).toString();
      const loadingMsg: Message = {
        id: loadingId,
        type: 'loading',
        content: '',
      };

      setMessages(prev => [...prev, userMsg, loadingMsg]);
      setInputValue('');
      setIsBuilding(true);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/build`,
          {
            message,
            doc_kind: docKind,
            target_role: targetRole || undefined,
            country: country || undefined,
            seniority: seniority || undefined,
            industry: industry || undefined,
            tone: tone || undefined,
            resume_id: uploadedResumeId || undefined, // Use uploaded resume as context
          },
          { withCredentials: true }
        );

        const data = response.data?.data;
        const document = data?.document;
        const agent = data?.agent;

        if (document?.id) {
          setCvId(document.id);
          setCvDocument(document);
        }

        // Replace loading with AI response
        const aiContent =
          agent?.message || 'Your CV has been generated. You can review and edit the sections on the right.';

        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingId
              ? { ...msg, type: 'assistant' as const, content: aiContent }
              : msg
          )
        );

        showToast('success', 'CV generated successfully!');
      } catch (error) {
        console.error('[CVBuilder] Build error:', error);

        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Failed to build CV. Please try again.';

        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingId
              ? { ...msg, type: 'assistant' as const, content: errorMessage, isError: true }
              : msg
          )
        );
      } finally {
        setIsBuilding(false);
      }
    },
    [docKind, targetRole, country, seniority, industry, tone, uploadedResumeId, showToast]
  );

  /**
   * Chat about an existing CV.
   * Calls POST /v1/cv-builder/chat
   */
  const handleChat = useCallback(
    async (message: string) => {
      if (!cvId) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
      };

      const loadingId = (Date.now() + 1).toString();
      const loadingMsg: Message = {
        id: loadingId,
        type: 'loading',
        content: '',
      };

      setMessages(prev => [...prev, userMsg, loadingMsg]);
      setInputValue('');

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/chat`,
          {
            cvId,
            message,
            doc_kind: docKind,
          },
          { withCredentials: true }
        );

        const data = response.data?.data;

        // Use messages array if available, otherwise use agent message
        if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          const aiContent = data?.agent?.message || 'I could not generate a response. Please try again.';
          setMessages(prev =>
            prev.map(msg =>
              msg.id === loadingId
                ? { ...msg, type: 'assistant' as const, content: aiContent }
                : msg
            )
          );
        }

        // Refresh the CV document to show any changes
        if (cvId) {
          try {
            const docResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/${cvId}`,
              { withCredentials: true }
            );
            if (docResponse.data?.data) {
              setCvDocument(docResponse.data.data);
            }
          } catch {
            // silently ignore refresh errors
          }
        }
      } catch (error) {
        console.error('[CVBuilder] Chat error:', error);

        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'AI could not respond. Please try again.';

        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingId
              ? { ...msg, type: 'assistant' as const, content: errorMessage, isError: true }
              : msg
          )
        );
      }
    },
    [cvId, docKind]
  );

  /**
   * Dispatch: if no CV exists yet, build; otherwise chat.
   */
  const handleSend = async (message: string) => {
    if (!cvId) {
      await handleBuild(message);
    } else {
      await handleChat(message);
    }
  };

  /**
   * Save edited section content.
   * Calls PATCH /v1/cv-builder/:cvId
   */
  const handleSaveSection = async (index: number) => {
    if (!cvId || !cvDocument) return;

    const updatedSections = [...cvDocument.sections];
    updatedSections[index] = { ...updatedSections[index], content: editContent };

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/${cvId}`,
        { sections: updatedSections },
        { withCredentials: true }
      );

      if (response.data?.data) {
        setCvDocument(response.data.data);
      } else {
        // Optimistic update
        setCvDocument(prev =>
          prev ? { ...prev, sections: updatedSections } : prev
        );
      }

      setEditingIndex(null);
      setEditContent('');
      showToast('success', 'Section updated!');
    } catch (error) {
      console.error('[CVBuilder] Update section error:', error);
      showToast('error', 'Failed to save section. Please try again.');
    }
  };

  /**
   * Export the CV document.
   * Calls POST /v1/cv-builder/:cvId/export
   */
  const handleExport = async (format: 'text' | 'docx' | 'pdf') => {
    if (!cvId) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cv-builder/${cvId}/export`,
        { format },
        { withCredentials: true }
      );

      const exportData = response.data?.data;

      if (format === 'text' && exportData?.content) {
        // Create and download text file
        const blob = new Blob([exportData.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportData.filename || 'cv.txt';
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportData?.content_b64) {
        // Decode base64 and download
        const mimeType = format === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf';
        const byteChars = atob(exportData.content_b64);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportData.filename || `cv.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      showToast('success', `CV exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('[CVBuilder] Export error:', error);
      showToast('error', 'Failed to export CV. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Loading Overlay */}
      {(isBuilding || (isLoadingSession && cvId) || isProcessingUpload) && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg">
            <div className="w-12 h-12 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {isBuilding
                  ? docKind === 'cv' ? 'Building your CV' : 'Writing your Cover Letter'
                  : isProcessingUpload
                  ? 'Parsing your resume'
                  : 'Loading CV session'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isBuilding
                  ? 'This usually takes 15-30 seconds'
                  : isProcessingUpload
                  ? 'Analyzing your resume structure and content...'
                  : 'Please wait...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb and New CV Button */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/career"
              className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Career Advisory / CV Builder
            </Link>

            {cvId && (
              <button
                onClick={handleNewCV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <Plus className="w-4 h-4" />
                New CV
              </button>
            )}
          </div>

          <hr className="my-10" />

          {/* Build Options (shown only before first build) */}
          {!cvId && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CV Options</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Doc Kind */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={docKind}
                    onChange={e => setDocKind(e.target.value as DocKind)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="cv">CV / Resume</option>
                    <option value="cover_letter">Cover Letter</option>
                  </select>
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Style</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value as CountryStyle)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="UK">UK</option>
                    <option value="US">US</option>
                    <option value="NG">Nigeria</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="EU">EU</option>
                  </select>
                </div>

                {/* Seniority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                  <input
                    type="text"
                    value={seniority}
                    onChange={e => setSeniority(e.target.value)}
                    placeholder="e.g. Senior, Mid-level, Junior"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g. Technology, Finance"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as ToneOption)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Default</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="bold">Bold</option>
                    <option value="formal">Formal</option>
                    <option value="warm">Warm</option>
                    <option value="confident">Confident</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - AI Chat */}
            <div className="col-span-5 sticky top-10 h-fit">
              <AIEditSidebar
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onToggleExpanded={toggleMessageExpanded}
                onFileUpload={handleFileUpload}
                intent="career-advisor"
                emptyStateMessage={
                  docKind === 'cv'
                    ? 'Tell me about the role you want to apply for and I\'ll build your CV...'
                    : 'Tell me about the role and I\'ll write a cover letter for you...'
                }
              />
            </div>

            {/* Right Side - CV Preview / Sections */}
            <div className="col-span-7">
              {cvDocument ? (
                <div className="space-y-4">
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{cvDocument.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {cvDocument.type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter'} &middot; {cvDocument.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport('text')}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        TXT
                      </button>
                      <button
                        onClick={() => handleExport('docx')}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        DOCX
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="px-3 py-2 text-sm bg-[#5A3FFF] text-white rounded-lg hover:bg-[#4A2FEF] transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>

                  {/* Section Cards */}
                  {cvDocument.sections.map((section, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{section.name}</h3>
                        {editingIndex === index ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveSection(index)}
                              className="text-green-600 hover:text-green-700 p-1"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingIndex(null);
                                setEditContent('');
                              }}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingIndex(index);
                              setEditContent(section.content);
                            }}
                            className="text-gray-400 hover:text-[#5A3FFF] p-1 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {editingIndex === index ? (
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]/30 focus:border-[#5A3FFF]"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-2xl">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {docKind === 'cv' ? 'Build Your CV' : 'Write a Cover Letter'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Fill in the options above, then tell the AI about the role you&apos;re applying for.
                      The AI will generate a tailored {docKind === 'cv' ? 'CV' : 'cover letter'} for you.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
