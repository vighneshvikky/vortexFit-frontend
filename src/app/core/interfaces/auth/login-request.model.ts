export interface LoginRequest {
    email: string;
    password: string;
    role: 'user' | 'trainer';
  }