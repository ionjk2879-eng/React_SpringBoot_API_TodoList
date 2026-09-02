import client from './client';
import type { ApiResponse, Page, Todo, TodoRequest } from '../types';

export async function getTodos(page: number, categoryId?: number): Promise<Page<Todo>> {
  const params: Record<string, unknown> = { page, size: 10, sort: 'createdAt,desc' };
  if (categoryId) params.categoryId = categoryId;
  const { data } = await client.get<ApiResponse<Page<Todo>>>('/todos', { params });
  return data.data;
}

export async function createTodo(req: TodoRequest): Promise<Todo> {
  const { data } = await client.post<ApiResponse<Todo>>('/todos', req);
  return data.data;
}

export async function updateTodo(id: number, req: TodoRequest): Promise<Todo> {
  const { data } = await client.put<ApiResponse<Todo>>(`/todos/${id}`, req);
  return data.data;
}

export async function toggleTodo(id: number): Promise<Todo> {
  const { data } = await client.patch<ApiResponse<Todo>>(`/todos/${id}/toggle`);
  return data.data;
}

export async function deleteTodo(id: number): Promise<void> {
  await client.delete(`/todos/${id}`);
}
