import { apiClient } from './api';
import { AuthService } from './auth';

export interface ChatMessage {
  message: string;
  session_id?: string;
  user_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export class ChatbotService {
  private static sessionId: string | null = null;

  static async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Get current user if authenticated
      let userId = 'anonymous';
      try {
        const user = await AuthService.getCurrentUser();
        userId = user.id.toString();
      } catch {
        // User not authenticated, use anonymous
      }

      const response = await apiClient.post<ChatResponse>('/chatbot/', {
        message,
        session_id: this.sessionId,
        user_id: userId
      });
      
      // Store session ID for future requests
      this.sessionId = response.session_id;
      
      return response;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  static clearSession(): void {
    this.sessionId = null;
  }
}