import axios from "axios";
import { BASE_API_URL } from "../axios";
import axiosInstance from "../axios";
import { FaithDevotionalGenerateRequest ,FaithJournalsRequest , FaithChatMessageRequest , FaithReminder , ExportRequest } from "./types";



export const getFaithHome = async () => {
  try {
    const response = await axiosInstance.post(`${BASE_API_URL}/faith/home`);

    return response.data;
  } catch (error) {
    console.error("Error fetching faith home:", error);
    throw error;
  }
};

export const faithChat = async (data: any) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_API_URL}/faith/chat`,
      data
    );

    return response.data;
  } catch (error) {
    console.error("Error sending faith chat request:", error);
    throw error;
  }
};



export const generateDevotional = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/faith/devotionals/generate`,
      data
    );

    return response.data;
  } catch (error) {
    console.error("Error generating devotional:", error);
    throw error;
  }
};

