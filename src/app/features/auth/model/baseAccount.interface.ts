export interface BaseAccount {
    id: string;
    name: string;
    role: 'user' | 'trainer'; 
    email: string;
  }
  