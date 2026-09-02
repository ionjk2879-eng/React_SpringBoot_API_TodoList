import client from './client';
import type { ApiResponse, Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get<ApiResponse<Category[]>>('/categories');
  return data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await client.post<ApiResponse<Category>>('/categories', { name });
  return data.data;
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const { data } = await client.put<ApiResponse<Category>>(`/categories/${id}`, { name });
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await client.delete(`/categories/${id}`);
}
