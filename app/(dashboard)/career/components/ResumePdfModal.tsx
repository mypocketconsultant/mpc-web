"use client";

import React, { useState } from "react";
import { X, Download, AlertCircle } from "lucide-react";
import axios from "axios";

interface ResumePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeTitle: string;
}

type ModalState = "initial" | "loading" | "success" | "error";

export default function ResumePdfModal({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
}: ResumePdfModalProps) {
  const [state, setState] = useState<ModalState>("initial");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  React.useEffect(() => {
    console.log("[ResumePdfModal] isOpen changed:", isOpen, "resumeId:", resumeId, "resumeTitle:", resumeTitle);
  }, [isOpen, resumeId, resumeTitle]);

  const handleProcessPdf = async () => {
    setState("loading");
    try {
      console.log("[ResumePdfModal] Fetching PDF for resumeId:", resumeId);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/resume-builder/${resumeId}/export-pdf`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      console.log("[ResumePdfModal] PDF received, size:", response.data.size);
      const pdfBlob = response.data as Blob;
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfBlobUrl);
      setState("success");
    } catch (error) {
      console.error("[ResumePdfModal] Error fetching PDF:", error);
      const message =
        axios.isAxiosError(error) && error.response?.status === 404
          ? "Resume not found"
          : "Failed to generate PDF. Please try again.";
      setErrorMessage(message);
      setState("error");
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${resumeTitle || "resume"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => {
    setErrorMessage("");
    handleProcessPdf();
  };

  const handleClose = () => {
    setState("initial");
    setPdfUrl("");
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {state === "initial" && "View Resume PDF"}
            {state === "loading" && "Generating PDF..."}
            {state === "success" && "Resume PDF"}
            {state === "error" && "Error"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
          {state === "initial" && (
            <div className="text-center space-y-6 max-w-md">
              <div>
                <p className="text-gray-600 text-lg mb-2">
                  Do you want to begin to process or download your PDF?
                </p>
                <p className="text-sm text-gray-500">
                  Click "Process & View" to see your resume before downloading.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleProcessPdf}
                  className="w-full px-6 py-3 bg-[#5A3FFF] text-white rounded-lg font-bold hover:bg-[#4a2fe0] transition-colors"
                >
                  Process & View
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {state === "loading" && (
            <div className="text-center space-y-6 max-w-md w-full">
              <div>
                <p className="text-gray-600 text-lg mb-4">Generating your PDF...</p>
                {/* Indeterminate Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5A3FFF] animate-pulse w-full"></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="w-full h-full flex flex-col">
              {/* PDF Viewer */}
              <div className="flex-1 w-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none"
                  title="Resume PDF"
                />
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-lg font-semibold mb-2">
                  {errorMessage}
                </p>
                <p className="text-sm text-gray-500">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full px-6 py-3 bg-[#5A3FFF] text-white rounded-lg font-bold hover:bg-[#4a2fe0] transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Download Button (Only in Success State) */}
        {state === "success" && (
          <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-[#5A3FFF] text-white rounded-lg font-bold hover:bg-[#4a2fe0] transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
