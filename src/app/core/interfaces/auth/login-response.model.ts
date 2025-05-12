export interface LoginResponse {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'trainer';
    };
  }
  