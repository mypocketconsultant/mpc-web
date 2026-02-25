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
  validationErrors,
}: FormSection4Props) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-4 md:gap-6 px-4 sm:px-6">
      {/* Image - hidden on mobile, shown on medium screens and up */}
      <div className="hidden md:flex flex-shrink-0 w-40 h-40 lg:w-[15.6vw] lg:h-[20.6vh] items-center mt-0 md:mt-[4.3vh]">
        <img
          src="/lets-begin1.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100 w-full h-full"
        />
      </div>

      <div className="flex flex-col w-full max-w-sm mt-4 md:mt-10">
        <p className="text-sm sm:text-base md:text-[1rem] font-[700] font-display text-black mb-2 sm:mb-[1vh] text-center md:text-left">
          Choose your path — you can <br className="hidden sm:block" />
          always explore others later.
        </p>

        <div className="mb-1 sm:mb-[0.5vh] w-full">
          <CustomDropdown
            options={["Career", "Life", "Study", "Business", "Finance"]}
            placeholder="Select your preferred module"
            value={career}
            onChange={(value: any) => setCareer(value)}
          />
        </div>
        {validationErrors.career && (
          <p className="text-red-500 text-xs sm:text-[0.7rem] font-railway mb-2 sm:mb-[2vh]">
            {validationErrors.career}
          </p>
        )}
      </div>
    </div>
  );
}
