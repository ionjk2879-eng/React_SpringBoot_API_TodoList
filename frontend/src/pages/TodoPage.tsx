import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from '../api/todos';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import { logout } from '../api/auth';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import type { Todo, TodoRequest } from '../types';

interface Props { email: string; onLogout: () => void; }

type StatusFilter = 'all' | 'todo' | 'progress' | 'done';

function classifyTodo(todo: Todo): 'todo' | 'progress' | 'done' {
  if (todo.completed) return 'done';
  if (todo.deadline) {
    const diff = new Date(todo.deadline).getTime() - Date.now();
    if (diff <= 24 * 60 * 60 * 1000) return 'progress';
  }
  return 'todo';
}

export default function TodoPage({ email, onLogout }: Props) {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const { data: todoPage, isLoading } = useQuery({
    queryKey: ['todos', selectedCategory],
    queryFn: () => getTodos(0, selectedCategory, 500),
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

  const allTodos: Todo[] = todoPage?.content ?? [];

  const counts = {
    todo: allTodos.filter(t => classifyTodo(t) === 'todo').length,
    progress: allTodos.filter(t => classifyTodo(t) === 'progress').length,
    done: allTodos.filter(t => classifyTodo(t) === 'done').length,
  };

  const filteredTodos = statusFilter === 'all'
    ? allTodos
    : allTodos.filter(t => classifyTodo(t) === statusFilter);

  const activeCategory = categories.find(c => c.id === selectedCategory);

  const statusCards: { key: StatusFilter; label: string; count: number; color: string; activeColor: string }[] = [
    { key: 'todo', label: '해야 할 일', count: counts.todo, color: 'text-[#787774] border-[#E9E9E7] bg-white', activeColor: 'border-[#191919] bg-[#191919] text-white' },
    { key: 'progress', label: '진행 중', count: counts.progress, color: 'text-orange-600 border-orange-200 bg-orange-50', activeColor: 'border-orange-500 bg-orange-500 text-white' },
    { key: 'done', label: '완료', count: counts.done, color: 'text-green-600 border-green-200 bg-green-50', activeColor: 'border-green-500 bg-green-500 text-white' },
  ];

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
            <button
              onClick={() => { setSelectedCategory(undefined); setStatusFilter('all'); }}
              className={`w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors ${
                !selectedCategory ? 'bg-orange-50 text-orange-700 font-medium' : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#191919]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${!selectedCategory ? 'bg-orange-400' : 'bg-[#D4D4D0]'}`} />
              전체
            </button>
            {categories.map(cat => (
              <div key={cat.id} className="group/cat flex items-center">
                <button
                  onClick={() => { setSelectedCategory(cat.id); setStatusFilter('all'); }}
                  className={`flex-1 flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors min-w-0 ${
                    selectedCategory === cat.id ? 'bg-orange-50 text-orange-700 font-medium' : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#191919]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedCategory === cat.id ? 'bg-orange-400' : 'bg-[#D4D4D0]'}`} />
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
                <button onClick={() => createCatMutation.mutate()} className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
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
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-[#191919]">
                {activeCategory ? activeCategory.name : '전체 할 일'}
              </h1>
              <p className="text-sm text-[#787774] mt-0.5">
                해야 할 일 {counts.todo}개 · 진행 중 {counts.progress}개 · 완료 {counts.done}개
              </p>
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

          {/* Status cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {statusCards.map(card => {
              const isActive = statusFilter === card.key;
              return (
                <button
                  key={card.key}
                  onClick={() => setStatusFilter(isActive ? 'all' : card.key)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    isActive ? card.activeColor : `${card.color} hover:shadow-sm`
                  }`}
                >
                  <span className={`text-2xl font-bold tracking-tight ${isActive ? 'text-white' : ''}`}>
                    {card.count}
                  </span>
                  <span className={`text-xs font-medium mt-1 ${isActive ? 'text-white/80' : ''}`}>
                    {card.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Todo list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 border-[#E9E9E7] border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 bg-[#F0F0EE] rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#C7C5C2]" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4H4a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-2M6 4a1 1 0 011-1h6a1 1 0 011 1v0a1 1 0 01-1 1H7a1 1 0 01-1-1zM10 10v4M8 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#787774]">
                {statusFilter === 'all' ? '할 일이 없습니다' :
                 statusFilter === 'todo' ? '해야 할 일이 없습니다' :
                 statusFilter === 'progress' ? '진행 중인 할 일이 없습니다' : '완료된 항목이 없습니다'}
              </p>
              <p className="text-xs text-[#C7C5C2] mt-1">
                {statusFilter === 'all' ? '위 버튼으로 추가해보세요' : '카드를 다시 클릭하면 전체 보기로 돌아갑니다'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E9E9E7] rounded-xl overflow-hidden">
              {filteredTodos.map(todo => (
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
