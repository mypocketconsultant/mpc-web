// Modal.tsx
"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
import { X } from 'lucide-react';
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-40 "
        onClick={onClose} // close when clicking outside
      />

      {/* Modal content */}
      <div className="fixed inset-0 flex justify-center items-center z-50 px-4">
        <div
          className="bg-white rounded-2xl  max-w-lg w-full relative shadow-lg"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          {/* Close button */}
          {/* <div
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-[#E8E8E8] rounded-full p-2"
            onClick={onClose}
          >
            <X  color="#000000"/>
          </div> */}

          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;