



export type  FaithChatMessageRequest = {
  message: string;
  session_id?: string;
};


export type  FaithDevotionalGenerateRequest = {
  topic: string;
  tone: 'encouraging' | 'scholarly' | 'poetic' | 'firm';
  length: 'short' | 'medium' | 'long';
}



export type  FaithJournalsRequest = {
  title: string;
  content: string;
}


export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type  FaithReminder  ={
  title: string;
  time: string; // "HH:mm" format
  timezone: string;
  days: DayOfWeek[];
}

export type ExportFormat = 'pdf' | 'docx' | 'txt';
export type ResourceType = 'journal' | 'prayer' | 'reflection';

export type  ExportRequest = {
  format: ExportFormat;
  resourceType: ResourceType;
  resourceId: string;
}