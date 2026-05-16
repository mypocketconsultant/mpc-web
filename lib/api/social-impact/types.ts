

export type  socialImpactProjectRequest = {
 
  title: string;
  description: string;
  location: string;
  category: string;
  createdAt?: Date;
  problem_profile?: string;
  hours_per_week?: string;
  solution_idea? : string;
  how_to_apply?: string;
}




// 1. Define the possible status and visibility literals
type ProjectStatus = 'draft' | 'published' | 'archived';
type Visibility = 'public' | 'private';



// 2. Define the core Data interface
export type SocialImpactProject = {
  id: string;
  user_id: string;
  title: string;
  status: ProjectStatus;
  description: string;
  category: string;
  remote_only: boolean;
  visibility: Visibility;
  partners: any[]; 
  created_at: string; 
  updated_at: string;
  
  // Nullable fields
  problem_profile: string | null;
  hours_per_week: number | null;
  country: string | null;
  city: string | null;
  location_text: string | null;
  solution_idea: string | null;
  how_to_apply: string | null;
  application_email: string | null;
  application_url: string | null;
  application_phone: string | null;
  published_role_snapshot: any | null;
  published_at: string | null;
}



// 1. Define the specific filters used in the request
export interface SocialImpactFilters {
  query: string | null;
  country: string | null;
  city: string | null;
  location_text: string | null;
  remote_only: boolean | null;
  source: 'all' | 'internal' | 'external'; 
  limit: number;
  offset: number;
}

export interface PaginatedRoles {
  items: any[]; 
  total: number;
  applied_filters: SocialImpactFilters;
}

// 3. Define the full API Response
export type RolesResponse  = {
  status: "success" | "error";
  message: string;
  data: PaginatedRoles;
}



export interface SocialImpactProjectsListResponse {
  status: "success" | "error";
  message: string;
  data: SocialImpactProject[]; 
}




export type  SocialImpactProjectResponse = {
 status: "success" | "error";
  message: string;
  data: SocialImpactProject; 
}




export type SocialImpactResources  = {
  ok: boolean;
  recent_documents: any[]; 
  saved_roles: any[];      
  projects: SocialImpactProject[];
}

export type SocialImpactResourcesResponse = {
  status: "success" | "error";
  message: string;
  data: SocialImpactResources;
}


// ----social impact chat---- 
export interface SocialImpactChatRequest {
  message: string;
  session_id?: string;
}




export interface ChatMetadata {
  confidence: number;
  notes: string;
  tool_results: {
    conversation_intelligence: {
      user_goal: string;
      conversation_stage: string;
      user_state: string;
      response_mode: string;
      next_best_action: string;
      follow_up_question: string;
      engagement_signal: string;
      confidence: number;
    };
    usage: {
      used_credits: number;
      remaining_credits: number;
      monthly_credit_limit: number;
    };
    charged_credits: number;
  };
}

export interface SocialImpactChatData {
  module: string;
  intent: string;
  message: string;
  plan: {
    steps: string[];
  };
  actions: any[];
  metadata: ChatMetadata;
}

export type SocialImpactChatResponse = {
  status: "success" | "error";
  message: string;
  data: SocialImpactChatData;
}



// ----list saved roles-----
export interface SavedSocialImpactRole {
  id: string;
  title: string;
  category: string;
  // Add other fields based on your Role schema
  [key: string]: any; 
}

export interface SavedRolesResponse {
  status: "success" | "error";
  message: string;
  data: SavedSocialImpactRole[]; 
}