export interface Admin {
    id: string;
    email: string;
    role: 'admin';
}

export interface AdminLoginResponse {
    id: string;
    message: string;
    refreshToken: string;
}

export interface AdminLoginDto {
    email: string;
    password: string;
} 