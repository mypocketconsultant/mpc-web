import axiosInstance from "../axios";
import { BASE_API_URL } from "../axios";
import { RolesResponse , socialImpactProjectRequest , SocialImpactProjectResponse , SocialImpactProjectsListResponse , SocialImpactResourcesResponse , SocialImpactChatRequest , SocialImpactChatResponse , SavedRolesResponse } from "./types";

// get all role
export const getSocialImpactRoles = async (): Promise<RolesResponse> => {
  try {
    const response = await axiosInstance.get<RolesResponse>('/v1/social-impact/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching social impact roles:', error);
    throw error;
  }
};



// list all saved roles

export const getSavedSocialImpactRoles = async (): Promise<SavedRolesResponse> => {
  try {
    const response = await axiosInstance.get<SavedRolesResponse>(
      '/v1/social-impact/roles/saved'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching saved roles:', error);
    throw error;
  }
};

// saved to draft / create a project

export const createSocialImpactProject = async (
  projectData: socialImpactProjectRequest
): Promise<SocialImpactProjectResponse> => {
  try {
    const response = await axiosInstance.post<SocialImpactProjectResponse>(
      '/v1/social-impact/projects',
      projectData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating social impact project:', error);
    throw error;
  }
};



// publish a project
export const publishSocialImpactProject = async (
  projectId: string
): Promise<SocialImpactProjectResponse> => {
  try {
    const response = await axiosInstance.post<SocialImpactProjectResponse>(
      `/v1/social-impact/projects/${projectId}/publish`,
      {} 
    );
    return response.data;
  } catch (error) {
    console.error(`Error publishing project with ID ${projectId}:`, error);
    throw error;
  }
};



// get a project
export const getSocialImpactProjectById = async (
  projectId: string
): Promise<SocialImpactProjectResponse> => {
  try {
    const response = await axiosInstance.get<SocialImpactProjectResponse>(
      `/v1/social-impact/projects/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw error;
  }
};




// list project
export const getAllSocialImpactProjects = async (): Promise<SocialImpactProjectsListResponse> => {
  try {
    const response = await axiosInstance.get<SocialImpactProjectsListResponse>(
      '/v1/social-impact/projects'
    );
    return response.data;
    console.log('PROJECT',response.data)
  } catch (error) {
    console.error('Error fetching social impact projects list:', error);
    throw error;
  }
};




// get resources

export const getSocialImpactResources = async (): Promise<SocialImpactResourcesResponse> => {
  try {
    const response = await axiosInstance.get<SocialImpactResourcesResponse>(
      '/v1/social-impact/resources'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching social impact resources:', error);
    throw error;
  }
};




// create a chat
export const sendSocialImpactChatMessage = async (
  chatPayload: SocialImpactChatRequest
): Promise<SocialImpactChatResponse> => {
  try {
    const response = await axiosInstance.post<SocialImpactChatResponse>(
      '/v1/social-impact/chat',
      chatPayload
    );
    return response.data;
  } catch (error) {
    console.error('Error in social impact chat:', error);
    throw error;
  }
};