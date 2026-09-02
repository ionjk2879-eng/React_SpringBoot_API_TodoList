import type { Todo } from '../types';

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

function isApproaching(todo: Todo): boolean {
  if (!todo.deadline || todo.completed) return false;
  const diff = new Date(todo.deadline).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString();
  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === todayStr) return `오늘 ${time}`;
  if (d.toDateString() === tomorrowStr) return `내일 ${time}`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' + time;
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: Props) {
  const approaching = isApproaching(todo);

  return (
    <div className={`group flex items-start gap-3 px-4 py-3 border-b border-[#E9E9E7] last:border-b-0 transition-colors ${
      approaching ? 'bg-orange-50/70' : 'hover:bg-[#FAFAF8]'
    }`}>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
        className={`mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-full border transition-all flex items-center justify-center ${
          todo.completed
            ? 'bg-green-500 border-green-500'
            : approaching
            ? 'border-orange-400 hover:border-orange-500 hover:bg-orange-50'
            : 'border-[#D4D4D0] hover:border-[#A8A8A4]'
        }`}
      >
        {todo.completed && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${
            todo.completed ? 'line-through text-[#C7C5C2]' : 'text-[#191919] font-medium'
          }`}>
            {todo.title}
          </span>

          {todo.categoryName && (
            <span className="inline-flex items-center text-[11px] text-[#787774] bg-[#F0F0EE] px-1.5 py-0.5 rounded">
              {todo.categoryName}
            </span>
          )}

          {todo.completed && (
            <span className="text-[11px] text-green-600 font-medium">완료</span>
          )}

          {approaching && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-orange-600 font-medium">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              마감임박
            </span>
          )}
        </div>

        {todo.content && (
          <p className="text-xs text-[#787774] mt-0.5 truncate">{todo.content}</p>
        )}

        {todo.deadline && (
          <p className={`text-xs mt-0.5 ${
            approaching && !todo.completed ? 'text-orange-500' : 'text-[#C7C5C2]'
          }`}>
            {formatDeadline(todo.deadline)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(todo)}
          aria-label="수정"
          className="p-1.5 rounded text-[#C7C5C2] hover:text-[#787774] hover:bg-[#F0F0EE] transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="삭제"
          className="p-1.5 rounded text-[#C7C5C2] hover:text-red-400 hover:bg-red-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.5 7.5h7L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
