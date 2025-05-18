export interface Admin {
  id: string;
  email: string;
  role: 'admin';
}




export interface AdminLoginDto {
    email: string;
    password: string;
} 