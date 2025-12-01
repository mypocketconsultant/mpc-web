import { apiService } from "@/lib/api/apiService";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export const signUpWithEmail = async (email: string, password: string, authType: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    const user = result.user;
    const response : any = await apiService.post("/v1/users/auth", {
      idToken,
      authType,
    //   firstname, 
    //   lastname,
    });

    await sendEmailVerification(user);
    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
}