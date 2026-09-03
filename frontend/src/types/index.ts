export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface TokenResponse {
  accessToken: string;
  email: string;
}

export interface UserProfile {
  email: string;
  nickname: string | null;
  hasProfileImage: boolean;
}

export interface Category {
  id: number;
  name: string;
  stampShape: string;
  hasCustomStamp: boolean;
  createdAt: string;
}

export interface Todo {
  id: number;
  title: string;
  content: string | null;
  deadline: string | null;
  completed: boolean;
  categoryId: number | null;
  categoryName: string | null;
  recurrence: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface TodoRequest {
  title: string;
  content?: string;
  deadline?: string;
  categoryId?: number | null;
  recurrence?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}
