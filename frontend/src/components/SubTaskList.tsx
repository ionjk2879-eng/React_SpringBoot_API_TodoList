import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSubTasks, createSubTask, toggleSubTask, deleteSubTask } from '../api/subtasks';

interface Props {
  todoId: number;
}

export default function SubTaskList({ todoId }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const queryKey = ['subtasks', todoId];

  const { data: subtasks = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getSubTasks(todoId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (t: string) => createSubTask(todoId, t),
    onSuccess: () => { invalidate(); setTitle(''); },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleSubTask(id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubTask(id),
    onSuccess: invalidate,
  });

  const doneCount = subtasks.filter(s => s.completed).length;

  return (
    <div className="pl-9 pr-3 pb-3 -mt-1">
      {isLoading ? (
        <p className="text-xs text-[#AEAEB2] py-1">불러오는 중…</p>
      ) : (
        <>
          {subtasks.length > 0 && (
            <div className="space-y-0.5 mb-1.5">
              {subtasks.map(s => (
                <div key={s.id} className="group/sub flex items-center gap-2 py-1">
                  <button
                    onClick={() => toggleMutation.mutate(s.id)}
                    aria-label={s.completed ? '완료 취소' : '완료 처리'}
                    className={`w-4 h-4 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                      s.completed ? 'bg-orange-500 border-orange-500' : 'border-[#C7C7CC] hover:border-[#98989D]'
                    }`}
                  >
                    {s.completed && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm min-w-0 truncate ${s.completed ? 'line-through text-[#AEAEB2]' : 'text-[#1D1D1F]'}`}>
                    {s.title}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(s.id)}
                    aria-label="하위 할 일 삭제"
                    className="opacity-0 group-hover/sub:opacity-100 group-focus-within/sub:opacity-100 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-[#AEAEB2] hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              <p className="text-[11px] text-[#AEAEB2] pl-6">{doneCount}/{subtasks.length}개 완료</p>
            </div>
          )}

          <div className="flex items-center gap-2 pl-0.5">
            <svg className="w-3 h-3 text-[#C7C7CC] flex-shrink-0" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="하위 할 일 추가"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && title.trim() && createMutation.mutate(title.trim())}
              className="flex-1 text-sm text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none min-w-0 py-1"
            />
          </div>
        </>
      )}
    </div>
  );
}
