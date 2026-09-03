package com.mysite.todo.domain.todo;

import com.mysite.todo.domain.subtask.SubTaskRepository;
import com.mysite.todo.domain.user.User;
import com.mysite.todo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Two independent housekeeping passes:
 *  - per-user opt-in cleanup of old completed todos (soft-deletes them into trash)
 *  - a fixed 7-day trash retention purge (hard-deletes, regardless of the setting above)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TodoCleanupScheduler {

    private static final int TRASH_RETENTION_DAYS = 7;

    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final SubTaskRepository subTaskRepository;

    @Scheduled(fixedRate = 3_600_000, initialDelay = 30_000)
    @Transactional
    public void cleanupCompletedTodos() {
        for (User user : userRepository.findByAutoCleanupDaysIsNotNull()) {
            Integer days = user.getAutoCleanupDays();
            if (days == null || days <= 0) continue;
            LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
            List<Todo> stale = todoRepository.findByUserAndCompletedTrueAndCompletedAtBefore(user, cutoff);
            for (Todo todo : stale) {
                todo.setDeletedAt(LocalDateTime.now());
            }
            todoRepository.saveAll(stale);
            if (!stale.isEmpty()) {
                log.info("Auto-cleanup: moved {} completed todo(s) to trash for user {}", stale.size(), user.getEmail());
            }
        }
    }

    @Scheduled(fixedRate = 3_600_000, initialDelay = 60_000)
    @Transactional
    public void purgeOldTrash() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(TRASH_RETENTION_DAYS);
        List<Todo> expired = todoRepository.findByDeletedAtBefore(cutoff);
        for (Todo todo : expired) {
            subTaskRepository.deleteByTodo(todo);
        }
        todoRepository.deleteAll(expired);
        if (!expired.isEmpty()) {
            log.info("Trash purge: permanently deleted {} todo(s) past {}-day retention", expired.size(), TRASH_RETENTION_DAYS);
        }
    }
}
