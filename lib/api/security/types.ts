export type SecuritySettingsResponse = {
  status: "success" | "error";
  message: string;
  data: SecuritySettingsData;
}

export type  SecuritySettingsData  = {
  email: string;
  passwordStrength: "weak" | "medium" | "strong" | string;
  mfaEnabled: boolean;
  trustedDevices: TrustedDevice[];
  alerts: SecurityAlerts;
}

export type TrustedDevice = {
  id: string;
  label: string;
  isCurrent: boolean;
  lastSignedInAt: string;
}

export type  SecurityAlerts = {
  newDeviceLoginAlerts: boolean;
  passwordChanges: boolean;
  securityUpdates: boolean;
  channels: AlertChannels;
}

export type AlertChannels  = {
  email: boolean;
  inApp: boolean;
  push: boolean;
}







export type MfaSettingsData = {
  backupEmail: string | null;
  phoneNumber: string | null;
  authenticatorAppEnabled: boolean;
  mfaEnabled: boolean;
}

export type  MfaSettingsResponse = {
  status: "success" | "error";
  message: string;
  data: MfaSettingsData;
}

export type UpdateMfaSettingsRequest = {
  backupEmail?: string;
  phoneNumber?: string;
  authenticatorAppEnabled?: boolean;
}


export type SendMfaCodeRequest = {
  channel: "email" | "phone" | "authenticator_app" | string;
}



export type SendMfaCodeResponse =  {
  status: "success" | "error";
  message: string;
  data: {
    channel: string;
    expiresInSeconds: number;
    demoCode: string;
  };
}



export interface VerifyMfaCodeRequest {
  channel: "email" | "sms" | "authenticator_app" | string;
  code: string;
}

export type VerifyMfaCodeResponse = {
  status: "success" | "error";
  message: string;
  data: {
    verified: boolean;
  };
}


export type TrustedDevicesResponse =  {
  status: "success" | "error";
  message: string;
  data: TrustedDevice[];
}



export type LogoutAllDevicesResponse  = {
  status: "success" | "error";
  message: string;
  data: {
    revoked: boolean;
  };
}





export type SecurityAlertPreferencesResponse = {
  status: "success" | "error";
  message: string;
  data: SecurityAlertPreferencesData;
}

export type SecurityAlertPreferencesData = {
  newDeviceLoginAlerts: boolean;
  passwordChanges: boolean;
  securityUpdates: boolean;
  channels: AlertChannels;
}



export type UpdateSecurityAlertsRequest = {
  newDeviceLoginAlerts: boolean;
  passwordChanges: boolean;
  securityUpdates: boolean;
  channels: AlertChannels;
}





export type PersonalizationSettingsData  ={
  appearance: "light" | "dark" | "system" | string;
  styleTone: string;
  headersAndLists: string;
  emoji: string;
}


export type PersonalizationSettingsResponse =  {
  status: "success" | "error";
  message: string;
  data: PersonalizationSettingsData;
}



export type UpdatePersonalizationSettingsRequest = {
  appearance: "light" | "dark" | "system" | string;
  styleTone: "default" | "professional" | "casual" | string;
  headersAndLists: "default" | string;
  emoji: "default" | "less" | "none" | "enabled" | string;
}


export type UpdatePersonalizationSettingsResponse = {
  status: "success" | "error";
  message: string;
  data: PersonalizationSettingsData;
}



export type PrivacyPolicyResponse = {
  status: "success" | "error";
  message: string;
  data: PrivacyPolicyData;
}

export type PrivacyPolicyData = {
  title: string;
  effectiveDate: string; 
  lastUpdated: string;   
  content: string;
}



export type  TermsOfServiceResponse = {
  status: "success" | "error";
  message: string;
  data: TermsOfServiceData;
}

export type TermsOfServiceData = {
  title: string;
  effectiveDate: string; 
  lastUpdated: string;   
  content: string;
}




export type ComplianceResponse = {
  status: "success" | "error";
  message: string;
  data: ComplianceData;
}

export type ComplianceData = {
  title: string;
  content: string;
}


export type DeleteAccountRequest = {
  confirm: boolean;
}

export type DeleteAccountResponse = {
  status: "success" | "error";
  message: string;
  data: {
    confirm: boolean;
  };
}



export type RestoreAccountRequest = {
  confirm: boolean;
}




export type RestoreAccountResponse = {
  status: "success" | "error";
  message: string;
  data: {
    confirm: boolean;
  };
}