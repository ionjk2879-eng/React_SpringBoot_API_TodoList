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
  const activeCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">

      {/* Header */}
      <header className="h-11 bg-white border-b border-[#E9E9E7] flex items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 3h9M1.5 6h9M1.5 9h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#191919]">Todo List</span>
        </div>

        <div className="flex-1" />

        <span className="text-xs text-[#C7C5C2]">{email}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-[#787774] hover:text-[#191919] px-2 py-1 rounded hover:bg-[#F0F0EE] transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col py-5 overflow-y-auto">
          <div className="px-4 mb-2">
            <span className="text-[10px] font-semibold text-[#C7C5C2] uppercase tracking-widest">카테고리</span>
          </div>

          <nav className="flex-1 px-2 space-y-0.5">
            {/* 전체 */}
            <button
              onClick={() => { setSelectedCategory(undefined); setPage(0); }}
              className={`w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors ${
                !selectedCategory
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#191919]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                !selectedCategory ? 'bg-orange-400' : 'bg-[#D4D4D0]'
              }`} />
              전체
            </button>

            {/* Category items */}
            {categories.map(cat => (
              <div key={cat.id} className="group/cat flex items-center">
                <button
                  onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                  className={`flex-1 flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors min-w-0 ${
                    selectedCategory === cat.id
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#191919]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                    selectedCategory === cat.id ? 'bg-orange-400' : 'bg-[#D4D4D0]'
                  }`} />
                  <span className="truncate">{cat.name}</span>
                </button>
                <button
                  onClick={() => deleteCatMutation.mutate(cat.id)}
                  aria-label="카테고리 삭제"
                  className="opacity-0 group-hover/cat:opacity-100 mr-1 w-5 h-5 flex items-center justify-center rounded text-[#C7C5C2] hover:text-red-400 hover:bg-red-50 transition-all"
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </nav>

          {/* Add category */}
          <div className="px-3 mt-3">
            <div className="flex items-center gap-1.5 border border-[#E9E9E7] rounded-lg px-2.5 py-1.5 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-100 transition-all bg-white">
              <svg className="w-3 h-3 text-[#C7C5C2] flex-shrink-0" viewBox="0 0 12 12" fill="none">
                <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="새 카테고리"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newCatName.trim() && createCatMutation.mutate()}
                className="flex-1 text-xs text-[#191919] placeholder-[#C7C5C2] bg-transparent outline-none min-w-0"
              />
              {newCatName.trim() && (
                <button
                  onClick={() => createCatMutation.mutate()}
                  className="flex-shrink-0 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  추가
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Divider */}
        <div className="w-px bg-[#E9E9E7] flex-shrink-0" />

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-8 py-6">

          {/* Page title */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#191919]">
                {activeCategory ? activeCategory.name : '전체 할 일'}
              </h1>
              {todoPage && (
                <p className="text-sm text-[#787774] mt-0.5">
                  {todoPage.totalElements}개
                </p>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              새 할 일
            </button>
          </div>

          {/* Todo list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 border-[#E9E9E7] border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-10 h-10 bg-[#F0F0EE] rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#C7C5C2]" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4H4a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-2M6 4a1 1 0 011-1h6a1 1 0 011 1v0a1 1 0 01-1 1H7a1 1 0 01-1-1zM10 10v4M8 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#787774]">할 일이 없습니다</p>
              <p className="text-xs text-[#C7C5C2] mt-1">위 버튼으로 추가해보세요</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E9E9E7] rounded-xl overflow-hidden">
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
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm text-[#787774] border border-[#E9E9E7] rounded-lg hover:bg-[#F0F0EE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    page === i
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'text-[#787774] border border-[#E9E9E7] hover:bg-[#F0F0EE]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm text-[#787774] border border-[#E9E9E7] rounded-lg hover:bg-[#F0F0EE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
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
