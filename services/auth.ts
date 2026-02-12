import { apiService } from "@/lib/api/apiService";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  country: string,
  preferredModule: string,
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    const idToken = await result.user.getIdToken();

    const user = result.user;

    const response: any = await apiService.post("/v1/auth/signup", {
      idToken,
      firstName,
      lastName,
      country,
      preferredModule,
    });

    await sendEmailVerification(user);

    return { response, user };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const verifyAuth = async () => {
  try {
    const response = await apiService.get("/v1/auth/me");
    return { response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
