"use client";
import CustomDropdown from "../ui/custom-dropdown";

interface FormSection3Props {
  country: string;
  setCountry: (country: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection3({
  country, 
  setCountry,
  validationErrors
}: FormSection3Props) {
  return (
    <div className="flex flex-row justify-center w-full max-w-5xl gap-6 ml-10">
      <div className="flex-shrink-0 w-[15.6vw] h-[20.6vh] flex items-center mt-[4.3vh]">
        <img
          src="/lets-begin1.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100"
          style={{
            transform: "rotate(0deg)",
          }}
        />
      </div>

      <div className="flex flex-col w-full max-w-sm mt-10">
        <h2 className="text-[1.4rem] font-display font-extrabold text-black mt-[2vh]">Welcome Remi!</h2>
        <p className="text-[1rem] font-[700] font-display text-black mb-[1vh]">Tell us where you are from</p>
        
        <div className="mb-[0.5vh]">
          <CustomDropdown
            options={["USA", "Canada", "UK", "Australia"]}
            placeholder="Select your country"
            value={country}
            onChange={(value: any) => setCountry(value)}
          />
        </div>
        {validationErrors.country && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.country}</p>
        )}
      </div>
    </div>
  );
}