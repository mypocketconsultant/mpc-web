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
  validationErrors
}: FormSection2Props) {
  return (
    <div className="flex flex-row justify-center w-full max-w-5xl gap-6 ml-16">
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

      <div className="flex flex-col w-full max-w-sm">
        <p className="text-[1.2rem] font-[600] font-display text-black mb-[1.4vh] mt-[2vh]">
          Congratulations on taking the <br /> first step in your growth process. <br />
          Get started by telling us your <br />name.
        </p>
        
        <input
          type="text"
          placeholder="Firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          className="w-[18.92vw] h-[3.0rem] mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.firstname && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.firstname}</p>
        )}
        
        <input
          type="text"
          placeholder="Lastname"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className="w-[18.92vw] h-[3.0rem] mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.lastname && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.lastname}</p>
        )}
      </div>
    </div>
  );
}