import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from '../api/todos';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadStampImage, deleteStampImage } from '../api/categories';
import { getProfile, updateNickname, uploadProfileImage, deleteProfileImage, changePassword, deleteAccount } from '../api/users';
import { logout } from '../api/auth';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import Calendar from '../components/Calendar';
import StampIcon, { STAMP_SHAPES } from '../components/StampIcon';
import CategoryStamp from '../components/CategoryStamp';
import ProfileAvatar from '../components/ProfileAvatar';
import ImageCropModal from '../components/ImageCropModal';
import ConfirmModal from '../components/ConfirmModal';
import { useDeadlineReminders } from '../hooks/useDeadlineReminders';
import type { Category, Todo, TodoRequest } from '../types';

interface Props { email: string; onLogout: () => void; }

type StatusFilter = 'all' | 'todo' | 'progress' | 'done';

function StampPicker({ value, onChange }: { value: string; onChange: (shape: string) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap px-0.5">
      {STAMP_SHAPES.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          aria-label={s.label}
          title={s.label}
          className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${
            value === s.id ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-[#D2D2D7] text-[#98989D] hover:border-[#C7C7CC] hover:text-[#86868B]'
          }`}
        >
          <StampIcon shape={s.id} className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

function groupByDate(todos: Todo[]): Todo[][] {
  const dateKey = (t: Todo) => t.deadline?.slice(0, 10) ?? null;
  const sorted = [...todos].sort((a, b) => (dateKey(a) ?? '9999-99-99').localeCompare(dateKey(b) ?? '9999-99-99'));
  const groups: Todo[][] = [];
  for (const todo of sorted) {
    const last = groups[groups.length - 1];
    if (last && dateKey(last[0]) === dateKey(todo)) {
      last.push(todo);
    } else {
      groups.push([todo]);
    }
  }
  return groups;
}

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverCategoryId, setDragOverCategoryId] = useState<number | 'none' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatStamp, setNewCatStamp] = useState('circle');
  const [newCatImageBlob, setNewCatImageBlob] = useState<Blob | null>(null);
  const [newCatImagePreviewUrl, setNewCatImagePreviewUrl] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(
    () => localStorage.getItem('showCalendar') !== 'false'
  );
  const [showSidebar, setShowSidebar] = useState(
    () => localStorage.getItem('showSidebar') !== 'false'
  );
  const [sidebarView, setSidebarView] = useState<'categories' | 'settings'>('categories');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryStamp, setEditingCategoryStamp] = useState('circle');
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<
    { kind: 'todo'; id: number } | { kind: 'category'; id: number; name: string } | null
  >(null);
  const [cropContext, setCropContext] = useState<
    { kind: 'profile' } | { kind: 'category'; categoryId: number } | { kind: 'newCategory' } | null
  >(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [stampVersions, setStampVersions] = useState<Record<number, number>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('notificationsEnabled') === 'true'
  );
  const [reminderLeadHours, setReminderLeadHours] = useState(
    () => Number(localStorage.getItem('reminderLeadHours')) || 24
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  function bumpStampVersion(id: number) {
    setStampVersions(v => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
  }

  function extractErrorMessage(err: unknown, fallback: string): string {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return message ?? fallback;
  }

  const { data: todoPage, isLoading, isError } = useQuery({
    queryKey: ['todos', selectedCategory],
    queryFn: () => getTodos(0, selectedCategory, 500),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const invalidateTodos = () => qc.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => { invalidateTodos(); setShowForm(false); },
    onError: err => setErrorMsg(extractErrorMessage(err, '할 일을 추가하지 못했습니다.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: TodoRequest }) => updateTodo(id, req),
    onSuccess: () => { invalidateTodos(); setEditingTodo(null); },
    onError: err => setErrorMsg(extractErrorMessage(err, '할 일을 수정하지 못했습니다.')),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: invalidateTodos,
    onError: err => setErrorMsg(extractErrorMessage(err, '완료 상태를 변경하지 못했습니다.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => { invalidateTodos(); setConfirmDelete(null); },
    onError: err => {
      setErrorMsg(extractErrorMessage(err, '할 일을 삭제하지 못했습니다.'));
      setConfirmDelete(null);
    },
  });

  const createCatMutation = useMutation({
    mutationFn: () => createCategory(newCatName, newCatStamp),
    onSuccess: (created: Category) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      if (newCatImageBlob) {
        uploadStampMutation.mutate({ id: created.id, blob: newCatImageBlob });
      }
      setNewCatName('');
      setNewCatStamp('circle');
      setNewCatImageBlob(null);
      setNewCatImagePreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      setShowCategoryForm(false);
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '카테고리를 추가하지 못했습니다.')),
  });

  const renameCatMutation = useMutation({
    mutationFn: ({ id, name, stampShape }: { id: number; name: string; stampShape: string }) =>
      updateCategory(id, name, stampShape),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategoryId(null);
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '카테고리를 수정하지 못했습니다.')),
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      invalidateTodos();
      setSelectedCategory(undefined);
      setConfirmDelete(null);
    },
    onError: err => {
      setErrorMsg(extractErrorMessage(err, '카테고리를 삭제하지 못했습니다.'));
      setConfirmDelete(null);
    },
  });

  const uploadStampMutation = useMutation({
    mutationFn: ({ id, blob }: { id: number; blob: Blob }) => uploadStampImage(id, blob),
    onSuccess: (updated: Category) => {
      bumpStampVersion(updated.id);
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '도장 이미지를 업로드하지 못했습니다.')),
  });

  const deleteStampMutation = useMutation({
    mutationFn: (id: number) => deleteStampImage(id),
    onSuccess: (updated: Category) => {
      bumpStampVersion(updated.id);
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategoryStamp('circle');
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '도장 이미지를 삭제하지 못했습니다.')),
  });

  const updateNicknameMutation = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
    onError: err => setErrorMsg(extractErrorMessage(err, '닉네임을 변경하지 못했습니다.')),
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: (blob: Blob) => uploadProfileImage(blob),
    onSuccess: () => {
      setAvatarVersion(v => v + 1);
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '프로필 이미지를 업로드하지 못했습니다.')),
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: () => deleteProfileImage(),
    onSuccess: () => {
      setAvatarVersion(v => v + 1);
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '프로필 이미지를 삭제하지 못했습니다.')),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setPasswordSuccessMsg('비밀번호가 변경되었습니다.');
    },
    onError: err => setErrorMsg(extractErrorMessage(err, '비밀번호를 변경하지 못했습니다.')),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(deleteAccountPassword),
    onSuccess: () => { onLogout(); },
    onError: err => setErrorMsg(extractErrorMessage(err, '계정을 삭제하지 못했습니다.')),
  });

  function handleChangePassword() {
    setPasswordSuccessMsg(null);
    if (newPassword.length < 8) {
      setErrorMsg('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    changePasswordMutation.mutate();
  }

  function openCrop(context: { kind: 'profile' } | { kind: 'category'; categoryId: number } | { kind: 'newCategory' }, file: File | undefined) {
    if (!file) return;
    setCropContext(context);
    setCropImageUrl(URL.createObjectURL(file));
  }

  function closeCrop() {
    setCropImageUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setCropContext(null);
  }

  function handleCropConfirm(blob: Blob) {
    if (cropContext?.kind === 'profile') {
      uploadProfileImageMutation.mutate(blob);
    } else if (cropContext?.kind === 'category') {
      setEditingCategoryStamp('custom');
      uploadStampMutation.mutate({ id: cropContext.categoryId, blob });
    } else if (cropContext?.kind === 'newCategory') {
      setNewCatImageBlob(blob);
      setNewCatImagePreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    }
    closeCrop();
  }

  function clearNewCatImage() {
    setNewCatImageBlob(null);
    setNewCatImagePreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function closeCategoryForm() {
    setShowCategoryForm(false);
    setNewCatName('');
    setNewCatStamp('circle');
    clearNewCatImage();
  }

  function toggleSidebar() {
    setShowSidebar(v => {
      const next = !v;
      localStorage.setItem('showSidebar', String(next));
      return next;
    });
  }

  function toggleCalendar() {
    setShowCalendar(v => {
      const next = !v;
      localStorage.setItem('showCalendar', String(next));
      return next;
    });
  }

  async function handleLogout() { await logout(); onLogout(); }

  function handleDropTodo(todoId: number, dateStr: string) {
    const todo = allTodos.find(t => t.id === todoId);
    if (!todo) return;
    const time = todo.deadline ? todo.deadline.slice(11, 19) : '09:00:00';
    updateMutation.mutate({
      id: todoId,
      req: {
        title: todo.title,
        content: todo.content ?? undefined,
        deadline: `${dateStr}T${time}`,
        categoryId: todo.categoryId,
        recurrence: todo.recurrence,
      },
    });
  }

  function handleDropTodoOnCategory(todoId: number, categoryId: number | null) {
    const todo = allTodos.find(t => t.id === todoId);
    if (!todo || todo.categoryId === categoryId) return;
    updateMutation.mutate({
      id: todoId,
      req: {
        title: todo.title,
        content: todo.content ?? undefined,
        deadline: todo.deadline ?? undefined,
        categoryId,
        recurrence: todo.recurrence,
      },
    });
  }

  const allTodos: Todo[] = todoPage?.content ?? [];

  useDeadlineReminders(allTodos, notificationsEnabled, reminderLeadHours);

  function handleReminderLeadHoursChange(hours: number) {
    setReminderLeadHours(hours);
    localStorage.setItem('reminderLeadHours', String(hours));
  }

  async function toggleNotifications() {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      return;
    }
    if (typeof Notification === 'undefined') {
      setErrorMsg('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      setErrorMsg('브라우저 알림 권한이 꺼져 있습니다. 브라우저 설정에서 허용해주세요.');
      return;
    }
    setNotificationsEnabled(true);
    localStorage.setItem('notificationsEnabled', 'true');
  }

  const counts = {
    todo: allTodos.filter(t => classifyTodo(t) === 'todo').length,
    progress: allTodos.filter(t => classifyTodo(t) === 'progress').length,
    done: allTodos.filter(t => classifyTodo(t) === 'done').length,
  };

  const statusFilteredTodos = selectedDate
    ? allTodos.filter(t => t.deadline?.startsWith(selectedDate))
    : statusFilter === 'all'
    ? allTodos
    : allTodos.filter(t => classifyTodo(t) === statusFilter);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredTodos = trimmedQuery
    ? statusFilteredTodos.filter(t =>
        t.title.toLowerCase().includes(trimmedQuery) || (t.content ?? '').toLowerCase().includes(trimmedQuery)
      )
    : statusFilteredTodos;

  const activeCategory = categories.find(c => c.id === selectedCategory);

  const statusCards: { key: StatusFilter; label: string; count: number; color: string; activeColor: string }[] = [
    { key: 'todo',     label: '해야 할 일', count: counts.todo,     color: 'text-[#86868B] border-[#D2D2D7] bg-white',   activeColor: 'border-[#1D1D1F] bg-[#ECECEF] text-[#1D1D1F]' },
    { key: 'progress', label: '마감임박',   count: counts.progress, color: 'text-orange-600 border-orange-200 bg-orange-50', activeColor: 'border-orange-500 bg-orange-100 text-orange-700' },
    { key: 'done',     label: '완료',       count: counts.done,     color: 'text-green-600 border-green-200 bg-green-50',   activeColor: 'border-green-500 bg-green-100 text-green-700' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">

      {/* Header */}
      <header className="h-11 bg-white border-b border-[#D2D2D7] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          aria-label={showSidebar ? '사이드바 닫기' : '사이드바 열기'}
          className="w-7 h-7 -ml-1 flex items-center justify-center rounded-md text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F] transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5.5 2.5v9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 3h9M1.5 6h9M1.5 9h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1D1D1F]">Todo List</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={toggleCalendar}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
            showCalendar ? 'text-orange-600 bg-orange-50' : 'text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F]'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4.5 1v3M9.5 1v3M1.5 6h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          달력
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {showSidebar && (
        <>
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col py-6 overflow-y-auto bg-[#FAFAFC]">

          {/* Profile card */}
          <div className="flex flex-col items-center text-center px-4 mb-6 flex-shrink-0">
            <ProfileAvatar
              email={email}
              hasProfileImage={profile?.hasProfileImage ?? false}
              version={avatarVersion}
              className="w-12 h-12 text-base mb-2 flex-shrink-0"
            />
            <span className="text-sm font-semibold text-[#1D1D1F] truncate max-w-full">
              {profile?.nickname || email.split('@')[0]}
            </span>
            <span className="text-[11px] text-[#AEAEB2] truncate max-w-full" title={email}>{email}</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 space-y-0.5 min-h-0">
            <button
              onClick={() => setSidebarView('categories')}
              className={`w-full flex items-center gap-2 text-sm px-2.5 py-2 rounded-md transition-colors ${
                sidebarView === 'categories' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F]'
              }`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="6.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1.5" y="6.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <rect x="6.5" y="6.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              카테고리
            </button>

            {sidebarView === 'categories' && (
              <div className="pl-1 pt-0.5 space-y-0.5">
                <button
                  onClick={() => { setSelectedCategory(undefined); setStatusFilter('all'); setSelectedDate(null); }}
                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDragEnter={() => setDragOverCategoryId('none')}
                  onDragLeave={e => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverCategoryId(v => (v === 'none' ? null : v));
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOverCategoryId(null);
                    const todoId = Number(e.dataTransfer.getData('text/plain'));
                    if (todoId) handleDropTodoOnCategory(todoId, null);
                  }}
                  className={`w-full flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                    dragOverCategoryId === 'none' ? 'bg-orange-50 ring-1 ring-inset ring-orange-300' :
                    !selectedCategory ? 'text-orange-700 font-medium' : 'text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F]'
                  }`}
                >
                  <StampIcon shape="check" className={`w-3 h-3 flex-shrink-0 ${!selectedCategory ? 'text-orange-500' : 'text-[#C7C7CC]'}`} />
                  전체
                </button>
                {categories.map(cat => (
                  editingCategoryId === cat.id ? (
                    <div key={cat.id} className="border border-orange-200 rounded-lg bg-white shadow-sm overflow-hidden">
                      <div className="p-2.5 space-y-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingCategoryName}
                          onChange={e => setEditingCategoryName(e.target.value)}
                          onKeyDown={e => e.key === 'Escape' && setEditingCategoryId(null)}
                          className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-md px-2.5 py-1.5 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-colors min-w-0"
                        />
                        <div className="space-y-1.5">
                          <StampPicker value={editingCategoryStamp} onChange={setEditingCategoryStamp} />
                          <div className="flex items-center gap-2">
                            {editingCategoryStamp === 'custom' && cat.hasCustomStamp ? (
                              <>
                                <CategoryStamp
                                  categoryId={cat.id}
                                  stampShape={cat.stampShape}
                                  hasCustomStamp={cat.hasCustomStamp}
                                  version={stampVersions[cat.id] ?? 0}
                                  className="w-6 h-6 text-green-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteStampMutation.mutate(cat.id)}
                                  className="text-xs text-[#86868B] hover:text-red-500 transition-colors"
                                >
                                  이미지 삭제
                                </button>
                              </>
                            ) : (
                              <label className="text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer transition-colors">
                                이미지로 내 도장 만들기
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    e.target.value = '';
                                    openCrop({ kind: 'category', categoryId: cat.id }, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex border-t border-[#F0F0F5]">
                        <button
                          disabled={renameCatMutation.isPending}
                          onClick={() => {
                            if (editingCategoryName.trim()) {
                              renameCatMutation.mutate({ id: cat.id, name: editingCategoryName.trim(), stampShape: editingCategoryStamp });
                            }
                          }}
                          className="flex-1 text-xs text-orange-600 hover:text-orange-700 font-medium py-2 hover:bg-orange-50 transition-colors disabled:opacity-50"
                        >
                          {renameCatMutation.isPending ? '저장 중…' : '저장'}
                        </button>
                        <div className="w-px bg-[#F0F0F5]" />
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="flex-1 text-xs text-[#86868B] hover:text-[#1D1D1F] py-2 hover:bg-[#FAFAFC] transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={cat.id} className="group/cat flex items-center">
                      <button
                        onClick={() => { setSelectedCategory(cat.id); setStatusFilter('all'); setSelectedDate(null); }}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDragEnter={() => setDragOverCategoryId(cat.id)}
                        onDragLeave={e => {
                          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                          setDragOverCategoryId(v => (v === cat.id ? null : v));
                        }}
                        onDrop={e => {
                          e.preventDefault();
                          setDragOverCategoryId(null);
                          const todoId = Number(e.dataTransfer.getData('text/plain'));
                          if (todoId) handleDropTodoOnCategory(todoId, cat.id);
                        }}
                        className={`flex-1 flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md transition-colors min-w-0 ${
                          dragOverCategoryId === cat.id ? 'bg-orange-50 ring-1 ring-inset ring-orange-300' :
                          selectedCategory === cat.id ? 'text-orange-700 font-medium' : 'text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <CategoryStamp
                          categoryId={cat.id}
                          stampShape={cat.stampShape}
                          hasCustomStamp={cat.hasCustomStamp}
                          version={stampVersions[cat.id] ?? 0}
                          className={`w-3 h-3 flex-shrink-0 ${selectedCategory === cat.id ? 'text-orange-500' : 'text-[#C7C7CC]'}`}
                        />
                        <span className="truncate">{cat.name}</span>
                      </button>
                      <button
                        onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryStamp(cat.stampShape); }}
                        aria-label="카테고리 수정"
                        className="opacity-0 group-hover/cat:opacity-100 group-focus-within/cat:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[#AEAEB2] hover:text-[#86868B] hover:bg-[#ECECEF] transition-all flex-shrink-0"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ kind: 'category', id: cat.id, name: cat.name })}
                        aria-label="카테고리 삭제"
                        className="opacity-0 group-hover/cat:opacity-100 group-focus-within/cat:opacity-100 mr-1 w-5 h-5 flex items-center justify-center rounded text-[#AEAEB2] hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )
                ))}

                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="w-full flex items-center gap-2 text-sm px-2.5 py-1.5 mt-1 rounded-md text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  새 카테고리
                </button>
              </div>
            )}

            <button
              onClick={() => setSidebarView('settings')}
              className={`w-full flex items-center gap-2 text-sm px-2.5 py-2 rounded-md transition-colors ${
                sidebarView === 'settings' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F]'
              }`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3h9M1.5 6h9M1.5 9h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="4" cy="3" r="1" fill="currentColor" />
                <circle cx="8" cy="6" r="1" fill="currentColor" />
                <circle cx="5" cy="9" r="1" fill="currentColor" />
              </svg>
              설정
            </button>
          </nav>

          {/* Logout — pinned to bottom, always visible */}
          <div className="px-2 pt-3 mt-2 border-t border-[#D2D2D7] flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm px-2.5 py-2 rounded-md text-[#86868B] hover:bg-[#ECECEF] hover:text-[#1D1D1F] transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 1.5H2a1 1 0 00-1 1v7a1 1 0 001 1h2.5M7.5 8.5L10.5 6 7.5 3.5M10.5 6H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              로그아웃
            </button>
          </div>
        </aside>

        {/* Divider */}
        <div className="w-px bg-[#D2D2D7] flex-shrink-0" />
        </>
        )}

        {/* Main — split 50/50, or full-width Settings */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {sidebarView === 'settings' ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 min-w-0">

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg mb-4 max-w-md">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            <h1 className="text-xl font-semibold text-[#1D1D1F] mb-1">설정</h1>
            <p className="text-sm text-[#86868B] mb-6">계정 정보를 관리하세요</p>

            <div className="max-w-md bg-white border border-[#D2D2D7] rounded-xl p-6 space-y-6 shadow-sm shadow-black/[0.03]">

              {/* Profile image */}
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  email={email}
                  hasProfileImage={profile?.hasProfileImage ?? false}
                  version={avatarVersion}
                  className="w-20 h-20 text-2xl flex-shrink-0"
                />
                <div>
                  <label className="inline-block text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer transition-colors">
                    이미지 변경
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        openCrop({ kind: 'profile' }, file);
                      }}
                    />
                  </label>
                  {profile?.hasProfileImage && (
                    <button
                      type="button"
                      onClick={() => deleteProfileImageMutation.mutate()}
                      className="block mt-1 text-xs text-[#86868B] hover:text-red-500 transition-colors"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-[#D2D2D7]" />

              {/* Nickname */}
              <div>
                <label className="block text-xs font-medium text-[#86868B] uppercase tracking-wide mb-1.5">닉네임</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={email.split('@')[0]}
                    value={nicknameInput ?? profile?.nickname ?? ''}
                    onChange={e => setNicknameInput(e.target.value)}
                    maxLength={50}
                    className="flex-1 text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                  />
                  {nicknameInput !== null && nicknameInput !== (profile?.nickname ?? '') && (
                    <button
                      type="button"
                      onClick={() => {
                        updateNicknameMutation.mutate(nicknameInput);
                        setNicknameInput(null);
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium flex-shrink-0 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      저장
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-[#D2D2D7]" />

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-medium text-[#86868B] uppercase tracking-wide mb-1.5">이메일</label>
                <p className="text-sm text-[#1D1D1F]">{email}</p>
              </div>

              <div className="border-t border-[#D2D2D7]" />

              {/* Deadline reminders */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#1D1D1F] font-medium">마감 알림</p>
                    <p className="text-xs text-[#86868B] mt-0.5">마감 전 브라우저 알림을 보내드려요</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsEnabled}
                    onClick={toggleNotifications}
                    className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-orange-500' : 'bg-[#D2D2D7]'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      notificationsEnabled ? 'translate-x-4' : ''
                    }`} />
                  </button>
                </div>
                {notificationsEnabled && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                      알림 시점
                    </label>
                    <select
                      value={reminderLeadHours}
                      onChange={e => handleReminderLeadHoursChange(Number(e.target.value))}
                      className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors bg-white"
                    >
                      <option value={1}>1시간 전</option>
                      <option value={3}>3시간 전</option>
                      <option value={6}>6시간 전</option>
                      <option value={12}>12시간 전</option>
                      <option value={24}>24시간 전</option>
                      <option value={72}>3일 전</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-t border-[#D2D2D7]" />

              {/* Change password */}
              <div>
                <label className="block text-xs font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                  비밀번호 변경
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 (8자 이상)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={newPasswordConfirm}
                    onChange={e => setNewPasswordConfirm(e.target.value)}
                    className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!currentPassword || !newPassword || changePasswordMutation.isPending}
                      onClick={handleChangePassword}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                    >
                      {changePasswordMutation.isPending ? '변경 중…' : '비밀번호 변경'}
                    </button>
                    {passwordSuccessMsg && (
                      <span className="text-xs text-green-700">{passwordSuccessMsg}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="max-w-md bg-white border border-red-200 rounded-xl p-6 mt-4 shadow-sm shadow-black/[0.03]">
              <p className="text-sm text-[#1D1D1F] font-medium">계정 삭제</p>
              <p className="text-xs text-[#86868B] mt-0.5">모든 할 일, 카테고리, 프로필 정보가 영구적으로 삭제됩니다. 되돌릴 수 없습니다.</p>
              {!showDeleteAccount ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(true)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  계정 삭제
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={deleteAccountPassword}
                    onChange={e => setDeleteAccountPassword(e.target.value)}
                    className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowDeleteAccount(false); setDeleteAccountPassword(''); }}
                      className="flex-1 text-sm text-[#86868B] border border-[#D2D2D7] py-2 rounded-lg hover:bg-[#F5F5F7] transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={!deleteAccountPassword || deleteAccountMutation.isPending}
                      onClick={() => deleteAccountMutation.mutate()}
                      className="flex-1 text-sm font-medium py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleteAccountMutation.isPending ? '삭제 중…' : '정말 삭제하기'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
          <>
          {/* Left: Todo list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
            <div className="max-w-2xl mx-auto">

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg mb-4">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Title row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-[#1D1D1F]">
                  {activeCategory ? activeCategory.name : '전체 할 일'}
                </h1>
                <p className="text-sm text-[#86868B] mt-0.5">
                  해야 할 일 {counts.todo}개 · 마감임박 {counts.progress}개 · 완료 {counts.done}개
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center gap-1.5 border border-[#D2D2D7] hover:bg-[#F5F5F7] text-[#1D1D1F] text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  새 카테고리
                </button>
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
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AEAEB2]" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="할 일 검색"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="검색어 지우기"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AEAEB2] hover:text-[#86868B] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {statusCards.map(card => {
                const isActive = !selectedDate && statusFilter === card.key;
                return (
                  <button
                    key={card.key}
                    onClick={() => {
                      setSelectedDate(null);
                      setStatusFilter(isActive ? 'all' : card.key);
                    }}
                    className={`flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all ${
                      isActive ? card.activeColor : `${card.color} hover:shadow-sm`
                    }`}
                  >
                    <span className="text-2xl font-bold tracking-tight">
                      {card.count}
                    </span>
                    <span className="text-xs font-medium mt-0.5">
                      {card.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Date filter badge */}
            {selectedDate && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
                <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" viewBox="0 0 14 14" fill="none">
                  <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 1v3M9.5 1v3M1.5 6h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-orange-700 flex-1">{selectedDate} 마감</span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-orange-400 hover:text-orange-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Todo list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-[#D2D2D7] border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-[#86868B]">할 일을 불러오지 못했습니다</p>
                <button
                  onClick={() => qc.invalidateQueries({ queryKey: ['todos'] })}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-2 px-3 py-1.5 rounded-md hover:bg-orange-50 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 bg-[#ECECEF] rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#AEAEB2]" viewBox="0 0 20 20" fill="none">
                    <path d="M6 4H4a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-2M6 4a1 1 0 011-1h6a1 1 0 011 1v0a1 1 0 01-1 1H7a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#86868B]">
                  {trimmedQuery ? `"${searchQuery}" 검색 결과가 없습니다` :
                   selectedDate ? '해당 날짜의 할 일이 없습니다' :
                   statusFilter === 'todo' ? '해야 할 일이 없습니다' :
                   statusFilter === 'progress' ? '마감임박 할 일이 없습니다' :
                   statusFilter === 'done' ? '완료된 항목이 없습니다' : '할 일이 없습니다'}
                </p>
                <p className="text-xs text-[#AEAEB2] mt-1">
                  {trimmedQuery ? '다른 검색어로 시도해보세요' :
                   selectedDate ? '달력에서 다른 날짜를 선택하거나 클릭해서 해제하세요' : '위 버튼으로 추가해보세요'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupByDate(filteredTodos).map(group => (
                  <div key={group[0].id} className="bg-white border border-[#D2D2D7] rounded-xl overflow-hidden shadow-sm shadow-black/[0.03]">
                    {group.map(todo => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        stampShape={categories.find(c => c.id === todo.categoryId)?.stampShape ?? 'check'}
                        categoryId={todo.categoryId}
                        hasCustomStamp={categories.find(c => c.id === todo.categoryId)?.hasCustomStamp ?? false}
                        stampVersion={todo.categoryId != null ? stampVersions[todo.categoryId] ?? 0 : 0}
                        togglePending={toggleMutation.isPending && toggleMutation.variables === todo.id}
                        deletePending={deleteMutation.isPending && deleteMutation.variables === todo.id}
                        onToggle={id => toggleMutation.mutate(id)}
                        onEdit={t => setEditingTodo(t)}
                        onDelete={id => setConfirmDelete({ kind: 'todo', id })}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {showCalendar && (
            <>
              {/* Divider */}
              <div className="w-px bg-[#D2D2D7] flex-shrink-0" />

              {/* Right: Calendar */}
              <div className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
                <Calendar
                  todos={allTodos}
                  selectedDate={selectedDate}
                  onDateSelect={date => {
                    setSelectedDate(date);
                    if (date) setStatusFilter('all');
                  }}
                  onDropTodo={handleDropTodo}
                />
              </div>
            </>
          )}
          </>
          )}

        </div>
      </div>

      {/* Modals */}
      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.kind === 'todo' ? '할 일 삭제' : '카테고리 삭제'}
          message={
            confirmDelete.kind === 'todo'
              ? '이 할 일을 삭제하면 되돌릴 수 없습니다. 삭제할까요?'
              : `"${confirmDelete.name}" 카테고리를 삭제하면 카테고리 연결이 해제되고, 이 카테고리에 속한 할 일은 그대로 남습니다. 삭제할까요?`
          }
          pending={confirmDelete.kind === 'todo' ? deleteMutation.isPending : deleteCatMutation.isPending}
          onConfirm={() => {
            if (confirmDelete.kind === 'todo') deleteMutation.mutate(confirmDelete.id);
            else deleteCatMutation.mutate(confirmDelete.id);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={closeCrop}
        />
      )}
      {showCategoryForm && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) closeCategoryForm(); }}
        >
          <div className="bg-white rounded-xl shadow-2xl shadow-black/10 w-full max-w-sm">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#D2D2D7]">
              <h2 className="text-sm font-semibold text-[#1D1D1F]">새 카테고리</h2>
              <button
                onClick={closeCategoryForm}
                className="w-6 h-6 flex items-center justify-center rounded text-[#AEAEB2] hover:text-[#86868B] hover:bg-[#ECECEF] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                  이름 <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="카테고리 이름을 입력하세요"
                  value={newCatName}
                  autoFocus
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && newCatName.trim() && createCatMutation.mutate()}
                  className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                  도장
                </label>
                {newCatImagePreviewUrl ? (
                  <div className="flex items-center gap-2">
                    <img src={newCatImagePreviewUrl} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                    <button
                      type="button"
                      onClick={clearNewCatImage}
                      className="text-xs text-[#86868B] hover:text-red-500 transition-colors"
                    >
                      이미지 제거
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    {STAMP_SHAPES.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setNewCatStamp(s.id)}
                        aria-label={s.label}
                        title={s.label}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                          newCatStamp === s.id ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-[#D2D2D7] text-[#98989D] hover:border-[#C7C7CC] hover:text-[#86868B]'
                        }`}
                      >
                        <StampIcon shape={s.id} className="w-4 h-4" />
                      </button>
                    ))}
                    <label className="text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer whitespace-nowrap transition-colors ml-1">
                      이미지로 만들기
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          openCrop({ kind: 'newCategory' }, file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeCategoryForm}
                  className="flex-1 text-sm text-[#86868B] border border-[#D2D2D7] py-2 rounded-lg hover:bg-[#F5F5F7] transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={!newCatName.trim() || createCatMutation.isPending}
                  onClick={() => createCatMutation.mutate()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {createCatMutation.isPending ? '추가 중…' : '추가하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
