import client from './client';
import type { ApiResponse, UserProfile } from '../types';

export async function getProfile(): Promise<UserProfile> {
  const { data } = await client.get<ApiResponse<UserProfile>>('/users/me');
  return data.data;
}

export async function updateNickname(nickname: string): Promise<UserProfile> {
  const { data } = await client.put<ApiResponse<UserProfile>>('/users/me', { nickname });
  return data.data;
}

export async function uploadProfileImage(blob: Blob): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', blob, 'profile.png');
  const { data } = await client.post<ApiResponse<UserProfile>>('/users/me/profile-image', formData);
  return data.data;
}

export async function deleteProfileImage(): Promise<UserProfile> {
  const { data } = await client.delete<ApiResponse<UserProfile>>('/users/me/profile-image');
  return data.data;
}
