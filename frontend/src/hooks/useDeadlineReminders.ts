import { useEffect, useRef } from 'react';
import type { Todo } from '../types';

const STORAGE_KEY = 'notifiedTodoIds';
const CHECK_INTERVAL_MS = 60_000;

function getNotifiedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable — reminders just won't dedupe across reloads
  }
}

function formatLeadTime(hours: number): string {
  if (hours % 24 === 0 && hours >= 24) return `${hours / 24}일`;
  return `${hours}시간`;
}

export function useDeadlineReminders(todos: Todo[], enabled: boolean, leadHours: number) {
  const todosRef = useRef(todos);
  todosRef.current = todos;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('Notification' in window)) return;

    const windowMs = leadHours * 60 * 60 * 1000;

    function check() {
      if (Notification.permission !== 'granted') return;
      const notified = getNotifiedIds();
      let changed = false;
      const now = Date.now();
      for (const todo of todosRef.current) {
        if (todo.completed || !todo.deadline || notified.has(todo.id)) continue;
        const diff = new Date(todo.deadline).getTime() - now;
        if (diff > 0 && diff <= windowMs) {
          new Notification(`마감임박: ${todo.title}`, {
            body: `${formatLeadTime(leadHours)} 이내에 마감됩니다.`,
            tag: `todo-${todo.id}`,
          });
          notified.add(todo.id);
          changed = true;
        }
      }
      if (changed) saveNotifiedIds(notified);
    }

    check();
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [enabled, leadHours]);
}
