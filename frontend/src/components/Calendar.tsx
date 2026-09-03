import { useState, useMemo } from 'react';
import type { Todo } from '../types';

interface Props {
  todos: Todo[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  onDropTodo: (todoId: number, dateStr: string) => void;
}

function classifyTodo(todo: Todo): 'todo' | 'progress' | 'overdue' | 'done' {
  if (todo.completed) return 'done';
  if (todo.deadline) {
    const diff = new Date(todo.deadline).getTime() - Date.now();
    if (diff < 0) return 'overdue';
    if (diff <= 24 * 60 * 60 * 1000) return 'progress';
  }
  return 'todo';
}

const CHIP: Record<string, string> = {
  todo: 'bg-[#ECECEF] text-[#86868B]',
  progress: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-600 line-through',
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function Calendar({ todos, selectedDate, onDateSelect, onDropTodo }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    todos.forEach(todo => {
      if (todo.deadline) {
        const key = todo.deadline.slice(0, 10);
        (map[key] ??= []).push(todo);
      }
    });
    return map;
  }, [todos]);

  // 반복 일정은 다음 완료 시점까지 실제 행이 하나뿐이라, 달력에는 향후 발생일을 미리보기로만 투영한다.
  const recurringPreviewByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    const horizonDays = 90;
    todos.forEach(todo => {
      if (!todo.recurrence || !todo.deadline || todo.completed) return;
      const stepDays = todo.recurrence === 'WEEKLY' ? 7 : 1;
      const base = new Date(todo.deadline);
      const until = todo.recurrenceUntil ? new Date(todo.recurrenceUntil) : null;
      for (let i = stepDays; i <= horizonDays; i += stepDays) {
        const next = new Date(base);
        next.setDate(next.getDate() + i);
        if (until && next > until) break;
        const key = [
          next.getFullYear(),
          String(next.getMonth() + 1).padStart(2, '0'),
          String(next.getDate()).padStart(2, '0'),
        ].join('-');
        (map[key] ??= []).push(todo);
      }
    });
    return map;
  }, [todos]);

  const today = new Date();
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full select-none">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-base font-semibold text-[#1D1D1F]">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#ECECEF] text-[#86868B] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="text-xs text-[#86868B] hover:text-[#1D1D1F] px-2 py-1 rounded-md hover:bg-[#ECECEF] transition-colors"
          >
            오늘
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#ECECEF] text-[#86868B] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1 flex-shrink-0">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-semibold py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#AEAEB2]'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-[#D2D2D7] rounded-xl overflow-hidden border border-[#D2D2D7]">
        {cells.map((day, i) => {
          if (!day) return <div key={`b-${i}`} className="bg-[#FAFAFC]" />;

          const dateStr = fmt(day);
          const dayTodos = todosByDate[dateStr] ?? [];
          const previewTodos = recurringPreviewByDate[dateStr] ?? [];
          const totalCount = dayTodos.length + previewTodos.length;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isSun = i % 7 === 0;
          const isSat = i % 7 === 6;

          return (
            <div
              key={dateStr}
              onClick={() => onDateSelect(isSelected ? null : dateStr)}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDragEnter={() => setDragOverDate(dateStr)}
              onDragLeave={e => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverDate(d => (d === dateStr ? null : d));
              }}
              onDrop={e => {
                e.preventDefault();
                setDragOverDate(null);
                const todoId = Number(e.dataTransfer.getData('text/plain'));
                if (todoId) onDropTodo(todoId, dateStr);
              }}
              className={`p-1.5 cursor-pointer transition-colors min-h-[72px] ${
                isSelected ? 'bg-orange-50 ring-2 ring-inset ring-orange-400' :
                dragOverDate === dateStr ? 'bg-orange-50 ring-2 ring-inset ring-orange-300' :
                'bg-white hover:bg-[#FAFAFC]'
              }`}
            >
              <span
                className={`flex items-center justify-center w-[18px] h-[18px] text-[11px] font-medium rounded-full mb-1 ${
                  isToday ? 'bg-orange-500 text-white' :
                  isSun ? 'text-red-400' :
                  isSat ? 'text-blue-500' :
                  'text-[#86868B]'
                }`}
              >
                {day}
              </span>

              <div className="space-y-0.5">
                {dayTodos.slice(0, 2).map(todo => (
                  <div
                    key={todo.id}
                    className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${CHIP[classifyTodo(todo)]}`}
                  >
                    {todo.title}
                  </div>
                ))}
                {previewTodos.slice(0, Math.max(0, 2 - dayTodos.length)).map(todo => (
                  <div
                    key={`p-${todo.id}`}
                    title="반복 예정"
                    className="text-[10px] leading-tight px-1 py-0.5 rounded truncate border border-dashed border-[#D2D2D7] text-[#AEAEB2]"
                  >
                    ↻ {todo.title}
                  </div>
                ))}
                {totalCount > 2 && (
                  <div className="text-[10px] text-[#AEAEB2] px-1">+{totalCount - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
