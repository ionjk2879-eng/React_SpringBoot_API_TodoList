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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      title,
      content: content || undefined,
      // datetime-local 값은 "2026-09-03T18:00" 형식 → 초 추가 → LocalDateTime 파싱 가능
      deadline: deadline ? (deadline.length === 16 ? deadline + ':00' : deadline) : undefined,
      categoryId: categoryId ?? null,
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {initial ? 'Todo 수정' : 'Todo 추가'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text" placeholder="제목 *" value={title} required
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="내용 (선택)" value={content} rows={3}
            onChange={e => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <input
            type="datetime-local" value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={categoryId ?? ''}
            onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">카테고리 없음</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition">
              취소
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50">
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
