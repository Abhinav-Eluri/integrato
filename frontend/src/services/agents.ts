import { apiClient } from './api';
import { AuthService } from './auth';

export interface AgentMessage {
  message: string;
  agent_type: string;
  session_id?: string;
  user_id?: string;
}

export interface AgentResponse {
  response: string;
  session_id: string;
  agent_type: string;
}

export class AgentsService {
  private static sessionId: string | null = null;

  static async sendMessage(message: string, agentType: string): Promise<AgentResponse> {
    try {
      // Get current user if authenticated
      let userId = 'anonymous';
      try {
        const user = await AuthService.getCurrentUser();
        userId = user.id.toString();
      } catch {
        // User not authenticated, use anonymous
      }

      const response = await apiClient.post<AgentResponse>('/agents/chat/', {
        message,
        agent_type: agentType,
        session_id: this.sessionId,
        user_id: userId
      });
      
      // Store session ID for future requests
      this.sessionId = response.session_id;
      
      return response;
    } catch (error) {
      console.error('Error sending message to agent:', error);
      throw error;
    }
  }

  static clearSession(): void {
    this.sessionId = null;
  }

  static getAvailableAgents(): string[] {
    return ['finance', 'study_buddy', 'support', 'sales'];
  }
}