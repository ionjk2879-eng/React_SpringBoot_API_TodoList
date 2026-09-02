import axios from 'axios';
import type { ApiResponse, LoginRequest, RegisterRequest, TokenResponse } from '../types';

const base = `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth`;

export async function login(req: LoginRequest): Promise<TokenResponse> {
  const { data } = await axios.post<ApiResponse<TokenResponse>>(`${base}/login`, req, {
    withCredentials: true,
  });
  return data.data;
}

export async function register(req: RegisterRequest): Promise<TokenResponse> {
  const { data } = await axios.post<ApiResponse<TokenResponse>>(`${base}/register`, req, {
    withCredentials: true,
  });
  return data.data;
}

export async function logout(): Promise<void> {
  await axios.post(`${base}/logout`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  });
  localStorage.removeItem('accessToken');
}
