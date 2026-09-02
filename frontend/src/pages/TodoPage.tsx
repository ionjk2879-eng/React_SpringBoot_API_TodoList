import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from '../api/todos';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { logout } from '../api/auth';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import type { Todo, TodoRequest } from '../types';

interface Props { email: string; onLogout: () => void; }

export default function TodoPage({ email, onLogout }: Props) {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const { data: todoPage, isLoading } = useQuery({
    queryKey: ['todos', page, selectedCategory],
    queryFn: () => getTodos(page, selectedCategory),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const invalidateTodos = () => qc.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => { invalidateTodos(); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: TodoRequest }) => updateTodo(id, req),
    onSuccess: () => { invalidateTodos(); setEditingTodo(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: invalidateTodos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: invalidateTodos,
  });

  const createCatMutation = useMutation({
    mutationFn: () => createCategory(newCatName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setNewCatName(''); },
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      invalidateTodos();
      setSelectedCategory(undefined);
    },
  });

  async function handleLogout() {
    await logout();
    onLogout();
  }

  const todos = todoPage?.content ?? [];
  const totalPages = todoPage?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Todo List</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{email}</span>
          <button onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition">로그아웃</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">카테고리</h2>
            <button
              onClick={() => { setSelectedCategory(undefined); setPage(0); }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 transition ${
                !selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              전체
            </button>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center group">
                <button
                  onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                  className={`flex-1 text-left text-sm px-3 py-2 rounded-lg transition ${
                    selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {cat.name}
                </button>
                <button
                  onClick={() => deleteCatMutation.mutate(cat.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 px-1 transition">×</button>
              </div>
            ))}
            <div className="mt-3 flex gap-1">
              <input
                type="text" placeholder="새 카테고리" value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newCatName.trim() && createCatMutation.mutate()}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-0"
              />
              <button
                onClick={() => newCatName.trim() && createCatMutation.mutate()}
                className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded-lg hover:bg-blue-600 transition">+</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '전체'} Todo
              {todoPage && <span className="text-sm text-gray-400 ml-2">({todoPage.totalElements}개)</span>}
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
              + 추가
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">불러오는 중...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Todo가 없습니다. 추가해보세요!</div>
          ) : (
            <div className="space-y-3">
              {todos.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggle={id => toggleMutation.mutate(id)}
                  onEdit={t => setEditingTodo(t)}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    page === i ? 'bg-blue-500 text-white font-semibold' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                다음
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showForm && (
        <TodoForm
          categories={categories}
          onSubmit={req => createMutation.mutateAsync(req)}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingTodo && (
        <TodoForm
          categories={categories}
          initial={editingTodo}
          onSubmit={req => updateMutation.mutateAsync({ id: editingTodo.id, req })}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
