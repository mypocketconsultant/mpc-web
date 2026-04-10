import React from 'react';

interface CustomRadioButtonProps {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ 
  value, 
  selectedValue, 
  onChange 
}) => {
  const isSelected = value === selectedValue;

  const handleToggle = () => {
    const newValue = isSelected ? "" : value;
    onChange(newValue);
  };

  return (
    <label className="relative flex items-center justify-center cursor-pointer group p-1">
      <input
        type="radio"
        className="sr-only"
        checked={isSelected}
        onChange={handleToggle}
        onClick={handleToggle}
      />

      {/* Outer Circle */}
      <div 
        className={`
          w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center
          ${isSelected ? 'border-[#5A3FFF]' : 'border-[#062950] group-hover:border-gray-600'}
        `}
      >
        {/* Inner Circle (Dot) */}
        <div 
          className={`
            w-2 h-2 rounded-full transition-transform duration-200
            ${isSelected 
              ? 'scale-100 bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]' 
              : 'scale-0'}
          `}
        />
      </div>
    </label>
  );
};

export default CustomRadioButton;