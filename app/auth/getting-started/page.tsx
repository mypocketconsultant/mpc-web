"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import FormSection from "@/components/getting-started/step1";
import FormSection2 from "@/components/getting-started/step2";
import FormSection3 from "@/components/getting-started/step3";
import FormSection4 from "@/components/getting-started/step4";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { signUpWithEmail } from "@/services/auth";

export default function SignupPage() { 
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [country, setCountry] = useState("");
  const [career, setCareer] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  
  const searchParams = useSearchParams();
  const authType = searchParams.get('authType');

  const clearError = (fieldName: string) => {
    setValidationErrors((prev) => {
      const newErrors : any = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const validateStep = () => {
    const errors: { [key: string]: string } = {};
    if (currentStep === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email";
      }
      if (
        !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
      ) {
        errors.password =
          "Password must be at least 8 characters, include an uppercase letter, a number, and a special character";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    } else if (currentStep === 2) {
      if (!firstname.trim()) {
        errors.firstname = "Firstname is required";
      }
      if (!lastname.trim()) {
        errors.lastname = "Lastname is required";
      }
    } else if (currentStep === 3) {
      if (!country.trim()) {
        errors.country = "Country is required";
      }
    } else if (currentStep === 4) {
      if (!career.trim()) {
        errors.career = "Career is required";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailAuth = async (authType: string) => {
    console.log("Email authentication process started");
    console.log({ email, password, confirmPassword });
    await signUpWithEmail(email, password, authType);
    setValidationErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleNext = () => {
    console.log(currentStep)
    if (validateStep()) {
      if (authType === 'email' && currentStep === 1) {
        handleEmailAuth(authType);
      } else if (currentStep === 4) {
        console.log({
          email,
          password,
          firstname,
          lastname,
          country,
          career,
          confirmPassword,
        });
      } else {
        setValidationErrors({});
        setCurrentStep((prev) => Math.min(prev + 1, 4));
      }
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-white"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src="/logo.svg"
        alt="Logo"
        className="absolute w-[4.75vw] h-[7.34vh] top-[6.15vh] left-[6.31vw] transform rotate-0 opacity-100"
      />

      <div className="flex items-center justify-center w-[32.75vw] h-[0.4vh] bg-gray-300 relative mt-[20.8vh] rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-[#A393FF] rounded-full"
          style={{
            width: `${(currentStep / 4) * 100}%`,
          }}
        ></div>
      </div>

      <div className="flex mt-20 ml-[-80px]">
        {currentStep === 1 && (
          <FormSection
            email={email}
            password={password}
            setEmail={(value) => {
              setEmail(value);
              clearError("email");
            }}
            setPassword={(value) => {
              setPassword(value);
              clearError("password");
            }}
            confirmPassword={confirmPassword}
            setConfirmPassword={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 2 && (
          <FormSection2
            setFirstname={(value) => {
              setFirstname(value);
              clearError("firstname");
            }}
            firstname={firstname}
            lastname={lastname}
            setLastname={(value) => {
              setLastname(value);
              clearError("lastname");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 3 && (
          <FormSection3
            country={country}
            setCountry={(value) => {
              setCountry(value);
              clearError("country");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 4 && (
          <FormSection4
            career={career}
            setCareer={(value) => {
              setCareer(value);
              clearError("career");
            }}
            validationErrors={validationErrors}
          />
        )}
      </div>

      <div className="flex justify-between w-full px-40 mt-[24.06vh] fixed bottom-20">
        <button
          className="bg-white shadow-xl text-[#6549CC] px-4 py-2 rounded-[16px] font-bold font-railway text-[13px] border border-[#6549CC]"
          onClick={handleBack}
        >
          Back
        </button>
        <button
          className="bg-[#6549CC] shadow-xl text-[#FFE5DF] px-4 py-2 rounded-[16px] font-bold font-railway text-[13px]"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}