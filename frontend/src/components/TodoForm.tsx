import { useState } from 'react';
import type { Category, Todo, TodoRequest } from '../types';

interface Props {
  categories: Category[];
  initial?: Todo | null;
  onSubmit: (req: TodoRequest) => Promise<unknown>;
  onClose: () => void;
}

export default function TodoForm({ categories, initial, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 16) : ''
  );
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
  const [recurrence, setRecurrence] = useState<string>(initial?.recurrence ?? '');
  const [recurrenceUntil, setRecurrenceUntil] = useState<string>(
    initial?.recurrenceUntil ? initial.recurrenceUntil.slice(0, 10) : ''
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        content: content || undefined,
        deadline: deadline ? (deadline.length === 16 ? deadline + ':00' : deadline) : undefined,
        categoryId: categoryId ?? null,
        recurrence: recurrence || null,
        recurrenceUntil: recurrence && recurrenceUntil ? recurrenceUntil + 'T23:59:59' : null,
      });
    } catch {
      // 상위 컴포넌트가 에러 메시지를 표시한다; 폼은 다시 시도할 수 있도록 열어둔다.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl shadow-black/10 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#D2D2D7]">
          <h2 className="text-sm font-semibold text-[#1D1D1F]">
            {initial ? '할 일 수정' : '새 할 일'}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-[#AEAEB2] hover:text-[#86868B] hover:bg-[#ECECEF] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              제목 <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              placeholder="할 일을 입력하세요"
              value={title}
              required
              onChange={e => setTitle(e.target.value)}
              autoFocus
              className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              내용
            </label>
            <textarea
              placeholder="세부 내용을 입력하세요 (선택)"
              value={content}
              rows={3}
              onChange={e => setContent(e.target.value)}
              className="w-full text-sm text-[#1D1D1F] placeholder-[#AEAEB2] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                마감일
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                카테고리
              </label>
              <select
                value={categoryId ?? ''}
                onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors bg-white"
              >
                <option value="">없음</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
              반복
            </label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value)}
              className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors bg-white"
            >
              <option value="">반복 안 함</option>
              <option value="DAILY">매일</option>
              <option value="WEEKLY">매주</option>
            </select>
            {recurrence && !deadline && (
              <p className="text-[11px] text-orange-500 mt-1.5">반복하려면 마감일을 함께 입력하세요</p>
            )}
            {recurrence && (
              <div className="mt-2">
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">
                  반복 종료일
                </label>
                <input
                  type="date"
                  value={recurrenceUntil}
                  onChange={e => setRecurrenceUntil(e.target.value)}
                  min={deadline ? deadline.slice(0, 10) : undefined}
                  className="w-full text-sm text-[#1D1D1F] border border-[#D2D2D7] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
                />
                <p className="text-[11px] text-[#AEAEB2] mt-1">비워두면 계속 반복돼요</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm text-[#86868B] border border-[#D2D2D7] py-2 rounded-lg hover:bg-[#F5F5F7] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중…' : (initial ? '수정하기' : '추가하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
