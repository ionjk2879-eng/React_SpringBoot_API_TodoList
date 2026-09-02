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

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: Props) {
  const approaching = isApproaching(todo);

  let cardClass = 'bg-white border rounded-xl p-4 shadow-sm transition';
  if (todo.completed) cardClass += ' opacity-60 border-gray-200';
  else if (approaching) cardClass += ' border-orange-400 bg-orange-50';
  else cardClass += ' border-gray-200 hover:shadow-md';

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${
            todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-blue-400'
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
              {todo.title}
            </span>
            {todo.completed && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">완료</span>
            )}
            {approaching && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">⏰ 마감임박</span>
            )}
            {todo.categoryName && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{todo.categoryName}</span>
            )}
          </div>
          {todo.content && (
            <p className="text-sm text-gray-500 mt-1 truncate">{todo.content}</p>
          )}
          {todo.deadline && (
            <p className={`text-xs mt-1 ${approaching ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
              마감: {new Date(todo.deadline).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(todo)}
            className="text-xs text-gray-400 hover:text-blue-500 px-2 py-1 rounded hover:bg-blue-50 transition">
            수정
          </button>
          <button onClick={() => onDelete(todo.id)}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
