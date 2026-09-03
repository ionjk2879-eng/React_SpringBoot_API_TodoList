import client from './client';
import type { ApiResponse, SubTask } from '../types';

export async function getSubTasks(todoId: number): Promise<SubTask[]> {
  const { data } = await client.get<ApiResponse<SubTask[]>>(`/todos/${todoId}/subtasks`);
  return data.data;
}

export async function createSubTask(todoId: number, title: string): Promise<SubTask> {
  const { data } = await client.post<ApiResponse<SubTask>>(`/todos/${todoId}/subtasks`, { title });
  return data.data;
}

export async function toggleSubTask(id: number): Promise<SubTask> {
  const { data } = await client.patch<ApiResponse<SubTask>>(`/subtasks/${id}/toggle`);
  return data.data;
}

export async function deleteSubTask(id: number): Promise<void> {
  await client.delete(`/subtasks/${id}`);
}
