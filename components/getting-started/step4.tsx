"use client";
import CustomDropdown from "../ui/custom-dropdown";

interface FormSection4Props {
  career: string;
  setCareer: (career: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection4({
  career, 
  setCareer,
  validationErrors
}: FormSection4Props) {
  return (
    <div className="flex flex-row justify-center w-full max-w-5xl gap-6">
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
        <p className="text-[1rem] font-[700] font-display text-black mb-[1vh]">
          Choose your path — you can <br />always explore others later.
        </p>
        
        <div className="mb-[0.5vh]">
          <CustomDropdown
            options={["software engineer", "product manager", "designer", "other"]}
            placeholder="Select your career"
            value={career}
            onChange={(value: any) => setCareer(value)}
          />
        </div>
        {validationErrors.career && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.career}</p>
        )}
      </div>
    </div>
  );
}