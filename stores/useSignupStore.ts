import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SignupState {
  // Step tracking
  currentStep: number;

  // Step 1: Email/Password (email auth only)
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Name (email auth only)
  firstname: string;
  lastname: string;

  // Step 3: Country
  country: string;

  // Step 4: Career/Module preference
  career: string;

  // Auth related
  idToken: string;
  authType: "email" | "google" | null;

  // Actions
  setField: <K extends keyof Omit<SignupState, "setField" | "reset" | "clearSensitiveData" | "setStep">>(
    key: K,
    value: SignupState[K]
  ) => void;
  setStep: (step: number) => void;
  reset: () => void;
  clearSensitiveData: () => void;
}

const initialState = {
  currentStep: 1,
  email: "",
  password: "",
  confirmPassword: "",
  firstname: "",
  lastname: "",
  country: "",
  career: "",
  idToken: "",
  authType: null as "email" | "google" | null,
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      ...initialState,

      setField: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),

      setStep: (step) =>
        set((state) => ({
          ...state,
          currentStep: step,
        })),

      reset: () => set(initialState),

      // Clear sensitive data (passwords, tokens) - call after signup completion
      clearSensitiveData: () =>
        set((state) => ({
          ...state,
          password: "",
          confirmPassword: "",
          idToken: "",
        })),
    }),
    {
      name: "signup-storage",
      // Only persist non-sensitive fields
      partialize: (state) => ({
        currentStep: state.currentStep,
        email: state.email,
        firstname: state.firstname,
        lastname: state.lastname,
        country: state.country,
        career: state.career,
        authType: state.authType,
        // Explicitly exclude sensitive data from persistence
        // password, confirmPassword, and idToken are not persisted
      }),
    }
  )
);
