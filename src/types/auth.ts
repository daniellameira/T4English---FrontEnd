export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  role: string; // Ex: "Professor" ou "Student"
  expiresAt: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}