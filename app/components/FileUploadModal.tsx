import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10,
}: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `Only ${acceptedFileTypes.join(', ')} files are accepted`;
    }

    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpload(selectedFile);
      setSelectedFile(null);
      setIsUploading(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    setIsUploading(false);
    onClose();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl max-w-sm sm:max-w-lg w-full mx-auto overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-100 gap-4 sm:gap-0">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upload File</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
              {acceptedFileTypes.join(', ')} • Max {maxFileSize}MB
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                : error
                ? 'border-red-300 bg-red-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={acceptedFileTypes.join(',')}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      <File className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Click to replace or drag another file
                </p>
              </div>
            ) : error ? (
              <div className="space-y-2 sm:space-y-3">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-700 break-words">{error}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Try uploading a different file
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-indigo-100 rounded-full">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    Drag and drop your file here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    or{' '}
                    <span className="text-indigo-600 font-medium">
                      browse files
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-8 sm:px-10 py-2 sm:py-3 bg-[#5A3FFF] text-white rounded-full font-semibold text-sm sm:text-base hover:bg-[#4a2fe0] disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-[#5A3FFF] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Uploading...</span>
                </span>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}