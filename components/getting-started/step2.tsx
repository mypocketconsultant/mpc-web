"use client";

interface FormSection2Props {
  setFirstname: (firstname: string) => void;
  firstname: string;
  lastname: string;
  setLastname: (lastname: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection2({
  setFirstname,
  firstname,
  lastname,
  setLastname,
  validationErrors,
}: FormSection2Props) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-5xl gap-4 md:gap-6 lg:gap-8">
      {/* Image - hidden on mobile, visible on md+ */}
      <div className="hidden md:flex flex-shrink-0 w-32 h-32 md:w-40 md:h-40 lg:w-[15.6vw] lg:h-[20.6vh] items-center justify-center">
        <img
          src="/lets-begin1.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100 w-full h-full"
        />
      </div>

      <div className="flex flex-col w-full max-w-sm px-4 sm:px-0">
        <p className="text-base sm:text-lg md:text-xl lg:text-[1.2rem] font-semibold font-display text-black mb-3 sm:mb-4 md:mb-[1.4vh] mt-2 sm:mt-[2vh] text-center md:text-left">
          Congratulations on taking the first step in your growth process. Get
          started by telling us your name.
        </p>

        <input
          type="text"
          placeholder="Firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          className="w-full sm:w-[80%] md:w-[18.92vw] min-w-0 h-12 sm:h-[3.0rem] mb-2 sm:mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-sm sm:text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto md:mx-0"
        />
        {validationErrors.firstname && (
          <p className="text-red-500 text-xs sm:text-[0.7rem] font-railway mb-2 sm:mb-[2vh] text-center md:text-left">
            {validationErrors.firstname}
          </p>
        )}

        <input
          type="text"
          placeholder="Lastname"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className="w-full sm:w-[80%] md:w-[18.92vw] min-w-0 h-12 sm:h-[3.0rem] mb-2 sm:mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-sm sm:text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto md:mx-0"
        />
        {validationErrors.lastname && (
          <p className="text-red-500 text-xs sm:text-[0.7rem] font-railway mb-2 sm:mb-[2vh] text-center md:text-left">
            {validationErrors.lastname}
          </p>
        )}
      </div>
    </div>
  );
}
