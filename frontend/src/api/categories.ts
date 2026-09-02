import client from './client';
import type { ApiResponse, Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get<ApiResponse<Category[]>>('/categories');
  return data.data;
}

export async function createCategory(name: string, stampShape = 'circle'): Promise<Category> {
  const { data } = await client.post<ApiResponse<Category>>('/categories', { name, stampShape });
  return data.data;
}

export async function updateCategory(id: number, name: string, stampShape = 'circle'): Promise<Category> {
  const { data } = await client.put<ApiResponse<Category>>(`/categories/${id}`, { name, stampShape });
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/categories/${id}`);
}

export async function uploadStampImage(id: number, blob: Blob): Promise<Category> {
  const formData = new FormData();
  formData.append('file', blob, 'stamp.png');
  const { data } = await client.post<ApiResponse<Category>>(`/categories/${id}/stamp-image`, formData);
  return data.data;
}

export async function deleteStampImage(id: number): Promise<Category> {
  const { data } = await client.delete<ApiResponse<Category>>(`/categories/${id}/stamp-image`);
  return data.data;
}
