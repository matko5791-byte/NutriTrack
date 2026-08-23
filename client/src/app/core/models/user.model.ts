export interface User {
    id: string;
    username: string;
    email: string;
    profileCompleted: boolean;
    name?: string | null;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}
