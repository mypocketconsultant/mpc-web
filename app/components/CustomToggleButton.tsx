import React from 'react';

interface ToggleProps {
  enabled: boolean;
  setEnabled: (state: boolean) => void;
}

const CustomToggle: React.FC<ToggleProps> = ({ enabled, setEnabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => setEnabled(!enabled)} 
      // Removed focus:ring, focus:ring-offset, and added outline-none
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 
        outline-none border-none
        ${enabled ? 'bg-[#5A3FFF]' : 'bg-gray-300'}
      `}
    >
      <span className="sr-only">Toggle setting</span>
      
      {/* The sliding thumb */}
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export default CustomToggle;