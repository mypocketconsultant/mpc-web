"use client";

interface FormSectionProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection({
  email, 
  password, 
  setEmail, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword,
  validationErrors
}: FormSectionProps) {
  return (
    <div className="flex flex-row w-full max-w-4xl gap-2">
      <div className="flex-shrink-0 w-[15.6vw] h-[20.6vh] flex items-center mt-[4.3vh]">
        <img
          src="/lets-begin.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100"
          style={{
            transform: "rotate(0deg)",
          }}
        />
      </div>

      <div className="flex flex-col w-full max-w-sm">
        <h2 className="text-[1.4rem] font-display font-extrabold text-black mt-[2vh]">Hello!</h2>
        <p className="text-[1rem] font-[700] font-display text-black mb-[1vh]">Tell us your email address</p>
        
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-[21.8vw] h-[3.0rem] mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.email && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.email}</p>
        )}

        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-[21.8vw] h-[3.0rem] mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.password && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.password}</p>
        )}

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-[21.8vw] h-[3.0rem] mb-[0.5vh] font-railway border border-[#79747E] text-[#49454F] text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-[0.7rem] font-railway mb-[2vh]">{validationErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}