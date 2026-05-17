import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "../axios";
import axiosInstance from "../axios";
import { SecuritySettingsResponse , MfaSettingsResponse , UpdateMfaSettingsRequest , SendMfaCodeRequest , SendMfaCodeResponse , VerifyMfaCodeRequest , VerifyMfaCodeResponse , TrustedDevicesResponse , LogoutAllDevicesResponse , SecurityAlertPreferencesResponse, UpdateSecurityAlertsRequest , PersonalizationSettingsResponse , TermsOfServiceResponse , DeleteAccountRequest , DeleteAccountResponse , RestoreAccountRequest , RestoreAccountResponse } from "./types";



export const getSecuritySettings = async (): Promise<SecuritySettingsResponse> => {
  try {
    const response = await axiosInstance.get<SecuritySettingsResponse>(
      `${BASE_API_URL}/v1/settings/security`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching security settings:", error);
    throw error;
  }
};



export const getMfaSettings = async (): Promise<MfaSettingsResponse> => {
  try {
    const response = await axiosInstance.get<MfaSettingsResponse>(
      `${BASE_API_URL}/v1/settings/security/mfa`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching MFA settings:", error);
    throw error;
  }
};


export const updateMfaSettings = async (
  payload: UpdateMfaSettingsRequest
): Promise<MfaSettingsResponse> => {
  try {
    const response = await axiosInstance.patch<MfaSettingsResponse>(
      '/v1/settings/security/mfa',
      payload
    );

    return response.data;
  } catch (error) {
    const err = error as AxiosError;

    console.error("===== MFA UPDATE ERROR =====");
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Status Text:", err.response?.statusText);
    console.error("Response Data:", err.response?.data);
    console.error("Request URL:", err.config?.url);
    console.error("Method:", err.config?.method);
    console.error("Payload:", err.config?.data);
    console.error("Full Error Object:", err);

    throw err;
  }
};


export const sendMfaCode = async (
  payload: SendMfaCodeRequest
): Promise<SendMfaCodeResponse> => {
  try {
    const response = await axiosInstance.post<SendMfaCodeResponse>(
      '/v1/settings/security/mfa/send-code',
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error sending MFA code:", error);
    throw error;
  }
};




export const verifyMfaCode = async (
  payload: VerifyMfaCodeRequest
): Promise<VerifyMfaCodeResponse> => {
  try {
    const response = await axios.post<VerifyMfaCodeResponse>(
      `${BASE_API_URL}/v1/settings/security/mfa/verify-code`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error verifying MFA code:", error);
    throw error;
  }
};





export const getTrustedDevices = async (): Promise<TrustedDevicesResponse> => {
  try {
    const response = await axiosInstance.get<TrustedDevicesResponse>(
      `${BASE_API_URL}/settings/security/trusted-devices`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching trusted devices:", error);
    throw error;
  }
};



export const logoutAllDevices = async (): Promise<LogoutAllDevicesResponse> => {
  try {
    const response = await axios.post<LogoutAllDevicesResponse>(
      '/v1/settings/security/logout-all-devices'
    );

    return response.data;
  } catch (error) {
    console.error("Error logging out of all devices:", error);
    throw error;
  }
};




export const updateSecurityAlerts = async (
  payload: UpdateSecurityAlertsRequest
): Promise<SecurityAlertPreferencesResponse> => {
  try {
    console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2)); // CHECK THIS IN CONSOLE
    
    const response = await axiosInstance.patch<SecurityAlertPreferencesResponse>(
      '/v1/settings/security/alerts',
      payload,
      {
    // headers: {
    //   Authorization: `Bearer YOUR_ACTUAL_TOKEN_HERE` 
    // }
  }
    );

    return response.data;
  } catch (error) {
    // This will show you the ACTUAL error body from the backend
    if (axios.isAxiosError(error)) {
      console.error("Server Error Data:", error.response?.data);
    }
    throw error;
  }
};




export const getPersonalizationSettings = async (): Promise<PersonalizationSettingsResponse> => {
  try {
    const response = await axiosInstance.get<PersonalizationSettingsResponse>(
      '/v1/settings/personalization'
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching personalization settings:", error);
    throw error;
  }
};




export const getTermsOfService = async (): Promise<TermsOfServiceResponse> => {
  try {
    const response = await axiosInstance.get<TermsOfServiceResponse>(
      '/v1/settings/legal/terms-of-service'
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching terms of service:", error);
    throw error;
  }
};



export const deleteAccount = async (
  payload: DeleteAccountRequest
): Promise<DeleteAccountResponse> => {
  try {
    const response = await axiosInstance.post<DeleteAccountResponse>(
      '/v1/settings/account/delete',
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};




export const restoreAccount = async (
  payload: RestoreAccountRequest
): Promise<RestoreAccountResponse> => {
  try {
    const response = await axiosInstance.post<RestoreAccountResponse>(
      '/v1/settings/account/restore',
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error restoring account:", error);
    throw error;
  }
};