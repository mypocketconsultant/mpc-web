import React from "react";

type CustomRadioButtonProps = {
  checked?: boolean;
  onChange?: ((checked: boolean) => void) | ((value: string) => void);
  value?: string;
  selectedValue?: string;
};

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  checked,
  onChange,
  value,
  selectedValue,
}) => {
  const isChecked =
    typeof checked === "boolean" ? checked : value === selectedValue;

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();

    if (!onChange) return;

    if (typeof value === "string") {
      (onChange as (value: string) => void)(value);
      return;
    }

    (onChange as (checked: boolean) => void)(!isChecked);
  };

  return (
    <label
      className="relative flex items-center justify-center cursor-pointer group p-1"
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={handleToggle}
      />

      {/* Outer Circle */}
      <div
        className={`
          w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center
          ${
            isChecked
              ? "border-[#5A3FFF]"
              : "border-[#062950] group-hover:border-gray-600"
          }
        `}
      >
        {/* Inner Circle */}
        <div
          className={`
            w-2 h-2 rounded-full transition-transform duration-200
            ${
              isChecked
                ? "scale-100 bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
                : "scale-0"
            }
          `}
        />
      </div>
    </label>
  );
};

export default CustomRadioButton;