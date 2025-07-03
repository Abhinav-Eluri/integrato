import { apiClient } from './api';

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export class ChatbotService {
  static async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await apiClient.post<ChatResponse>('/chatbot/', {
        message
      });
      return response;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }
}