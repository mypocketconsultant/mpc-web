"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            style={{
              borderRadius: "4rem",
              width: `${(299 / 1728) * 100}vw`,
              height: `${(299 / 1117) * 100}vh`,
            }}
            width={299}
            height={299}
          />
          <p className="text-center font-display font-semibold text-[3rem] leading-[3rem] tracking-normal text-[#5A3FFF]">
            Intelligent Counsel, <br /> Anytime, Anywhere.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            className="bg-[#5A3FFF] text-[#FFD0C5] text-sm font-bold font-railway rounded-xl shadow-xl"
            style={{
              width: `${(133 / 1728) * 100}vw`,
              height: `${(54 / 1117) * 100}vh`,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
            }}
            onClick={() => {
              router.push("/auth/getting-started?authType=email");
            }}
          >
            Get started
          </button>
          <button className="bg-white text-[#6549CC] font-bold font-railway text-[0.8rem] rounded-lg shadow-xl hover:bg-gray-100 opacity-100 gap-2 px-3 py-4 w-[14.06vw] h-[5.01vh] flex items-center">
            <img
              src="/google-button.svg"
              alt="Google Icon"
              className="w-4 h-4 mt-0.5"
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}