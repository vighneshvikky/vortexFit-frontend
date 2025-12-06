export interface Admin {
  _id?: string;
  email: string;
  role: 'admin';
    verificationStatus?: 'not_submitted' | 'pending' | 'rejected' | 'approved';
    rejectionReason?: string;
    image?: string
}

export interface AdminLoginDto {
    email: string;
    password: string;
  
} 