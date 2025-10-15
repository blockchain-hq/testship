// API utilities for communicating with the Pulse backend
export const API_BASE_URL = 'http://localhost:3001';

export interface InstructionRequest {
  programId: string;
  instruction: string;
  accounts: any[];
  data: any;
}

export interface InstructionResponse {
  success: boolean;
  result?: any;
  error?: string;
  logs?: string[];
}

export const api = {
  async executeInstruction(request: InstructionRequest): Promise<InstructionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getPrograms(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/programs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      return [];
    }
  },

  async validateIDL(idl: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/validate-idl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
