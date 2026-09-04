import { useState } from 'react';
import type { Todo } from '../types';
import CategoryStamp from './CategoryStamp';
import SubTaskList from './SubTaskList';
import { findCategoryColor } from '../utils/categoryColors';

interface Props {
  todo: Todo;
  stampShape: string;
  categoryId: number | null;
  hasCustomStamp: boolean;
  categoryColor?: string | null;
  stampVersion?: number;
  togglePending?: boolean;
  deletePending?: boolean;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

function isApproaching(todo: Todo): boolean {
  if (!todo.deadline || todo.completed) return false;
  const diff = new Date(todo.deadline).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function isOverdue(todo: Todo): boolean {
  if (!todo.deadline || todo.completed) return false;
  return new Date(todo.deadline).getTime() - Date.now() < 0;
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

const RECURRENCE_LABEL: Record<string, string> = { DAILY: '매일', WEEKLY: '매주' };

export default function TodoCard({ todo, stampShape, categoryId, hasCustomStamp, categoryColor = null, stampVersion = 0, togglePending = false, deletePending = false, onToggle, onEdit, onDelete }: Props) {
  const approaching = isApproaching(todo);
  const overdue = isOverdue(todo);
  const colorSwatch = findCategoryColor(categoryColor);
  const [pressed, setPressed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function handleToggle() {
    if (togglePending) return;
    setPressed(true);
    window.setTimeout(() => setPressed(false), 280);
    onToggle(todo.id);
  }

  return (
    <div className="border-b border-[#D2D2D7] last:border-b-0">
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData('text/plain', String(todo.id));
          e.dataTransfer.effectAllowed = 'move';

          const ghost = document.createElement('div');
          ghost.textContent = todo.title;
          ghost.style.cssText =
            'position:absolute; top:-1000px; left:-1000px; max-width:180px; padding:6px 10px;' +
            'background:#1D1D1F; color:#fff; font-size:12px; font-weight:500; border-radius:8px;' +
            'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;' +
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 14, 14);
          window.setTimeout(() => document.body.removeChild(ghost), 0);
        }}
        className={`group relative flex items-stretch transition-all cursor-grab active:cursor-grabbing overflow-hidden ${
          overdue ? 'bg-red-50/70' : approaching ? 'bg-amber-50/70' : 'hover:bg-[#FAFAFC]'
        } ${pressed ? 'card-press' : ''} ${deletePending ? 'opacity-40 pointer-events-none' : ''}`}
      >

        {/* Left: Stamp zone — full-height dedicated completion column */}
        <button
          onClick={handleToggle}
          disabled={togglePending}
          aria-label={todo.completed ? '도장 취소' : '도장 찍기'}
          aria-busy={togglePending}
          className={`relative z-10 flex-shrink-0 w-16 flex items-center justify-center border-r transition-all disabled:cursor-wait ${
            todo.completed
              ? 'bg-green-50 border-r-green-200'
              : overdue
              ? 'border-r-[#D2D2D7] hover:bg-red-50/60'
              : approaching
              ? 'border-r-[#D2D2D7] hover:bg-amber-50/60'
              : 'border-r-[#D2D2D7] hover:bg-[#F5F5F7]'
          }`}
        >
          {togglePending ? (
            <span className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${
              todo.completed ? 'border-green-500' : 'border-[#C7C7CC]'
            }`} />
          ) : todo.completed ? (
            <CategoryStamp
              categoryId={categoryId}
              stampShape={stampShape}
              hasCustomStamp={hasCustomStamp}
              version={stampVersion}
              className="w-10 h-10 text-green-700 stamp-mark -rotate-[12deg]"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`w-8 h-8 transition-colors ${
                overdue ? 'text-red-300 hover:text-red-500'
                : approaching ? 'text-amber-400 hover:text-amber-600'
                : 'text-[#D2D2D7] hover:text-[#AEAEB2]'
              }`}
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </button>

        {/* Right: Content + actions */}
        <div className="flex flex-1 items-start gap-2 px-4 py-3 min-w-0">

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${
                todo.completed ? 'line-through text-[#AEAEB2]' : 'text-[#1D1D1F] font-medium'
              }`}>
                {todo.title}
              </span>

              {todo.categoryName && (
                <span className={`inline-flex items-center text-[11px] px-1.5 py-0.5 rounded ${
                  colorSwatch ? `${colorSwatch.bg} ${colorSwatch.text}` : 'text-[#86868B] bg-[#ECECEF]'
                }`}>
                  {todo.categoryName}
                </span>
              )}

              {todo.recurrence && RECURRENCE_LABEL[todo.recurrence] && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-[#86868B]">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6a4 4 0 016.5-3.1M2.5 1.5v2h2M10 6a4 4 0 01-6.5 3.1M9.5 10.5v-2h-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {RECURRENCE_LABEL[todo.recurrence]}
                  {todo.recurrenceUntil && ` · ~${new Date(todo.recurrenceUntil).getMonth() + 1}/${new Date(todo.recurrenceUntil).getDate()}`}
                </span>
              )}

              {todo.completed && (
                <span className="text-[11px] text-green-700/80 font-medium">완료</span>
              )}

              {overdue && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-red-600 font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  기한초과
                </span>
              )}

              {approaching && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  마감임박
                </span>
              )}
            </div>

            {todo.content && (
              <p className="text-xs text-[#86868B] mt-0.5 truncate">{todo.content}</p>
            )}

            {todo.deadline && (
              overdue ? (
                <p className="text-xs mt-1 inline-block">
                  <span className="bg-red-200/70 text-red-800 px-1 py-0.5 -mx-1 rounded-[2px]">
                    {formatDeadline(todo.deadline)}
                  </span>
                </p>
              ) : approaching && !todo.completed ? (
                <p className="text-xs mt-1 inline-block">
                  <span className="bg-amber-200/70 text-amber-800 px-1 py-0.5 -mx-1 rounded-[2px]">
                    {formatDeadline(todo.deadline)}
                  </span>
                </p>
              ) : (
                <p className="text-xs mt-0.5 text-[#AEAEB2]">{formatDeadline(todo.deadline)}</p>
              )
            )}
          </div>

          {/* Expand subtasks */}
          <button
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? '하위 할 일 접기' : '하위 할 일 펼치기'}
            aria-expanded={expanded}
            className="relative z-10 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-[#C7C7CC] hover:text-[#86868B] hover:bg-[#ECECEF] transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Actions */}
          <div className="self-stretch flex items-center gap-0.5 flex-shrink-0 w-0 group-hover:w-[68px] group-focus-within:w-[68px] overflow-hidden transition-[width] duration-200 ease-out bg-[#ECECEF] rounded-md">
            <button
              onClick={() => onEdit(todo)}
              aria-label="수정"
              className="p-1.5 ml-1 rounded text-[#98989D] hover:text-[#1D1D1F] hover:bg-white transition-colors flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              aria-label="삭제"
              className="p-1.5 rounded text-[#98989D] hover:text-red-500 hover:bg-white transition-colors flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.5 7.5h7L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {expanded && <SubTaskList todoId={todo.id} />}
    </div>
  );
}
