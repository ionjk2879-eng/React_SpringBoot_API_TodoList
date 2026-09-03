package com.mysite.todo.domain.todo;

import com.mysite.todo.domain.category.Category;
import com.mysite.todo.domain.category.CategoryRepository;
import com.mysite.todo.domain.subtask.SubTaskRepository;
import com.mysite.todo.domain.todo.dto.TodoRequest;
import com.mysite.todo.domain.todo.dto.TodoResponse;
import com.mysite.todo.domain.user.User;
import com.mysite.todo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class TodoService {

    private static final Set<String> ALLOWED_RECURRENCE = Set.of("DAILY", "WEEKLY");

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SubTaskRepository subTaskRepository;

    public Page<TodoResponse> getAll(String email, Long categoryId, Pageable pageable) {
        User user = getUser(email);
        Page<Todo> page = (categoryId != null)
                ? todoRepository.findByUserAndCategoryId(user, categoryId, pageable)
                : todoRepository.findByUser(user, pageable);
        return page.map(TodoResponse::new);
    }

    @Transactional
    public TodoResponse create(String email, TodoRequest req) {
        User user = getUser(email);
        Todo todo = new Todo();
        todo.setUser(user);
        applyRequest(todo, req, user);
        return new TodoResponse(todoRepository.save(todo));
    }

    @Transactional
    public TodoResponse update(String email, Long id, TodoRequest req) {
        User user = getUser(email);
        Todo todo = getTodo(id, user);
        applyRequest(todo, req, user);
        return new TodoResponse(todoRepository.save(todo));
    }

    @Transactional
    public TodoResponse toggleComplete(String email, Long id) {
        User user = getUser(email);
        Todo todo = getTodo(id, user);
        boolean completing = !todo.isCompleted();
        todo.setCompleted(completing);
        TodoResponse response = new TodoResponse(todoRepository.save(todo));

        if (completing && todo.getRecurrence() != null && todo.getDeadline() != null) {
            Todo next = new Todo();
            next.setUser(user);
            next.setTitle(todo.getTitle());
            next.setContent(todo.getContent());
            next.setCategory(todo.getCategory());
            next.setRecurrence(todo.getRecurrence());
            next.setDeadline(todo.getDeadline().plusDays("WEEKLY".equals(todo.getRecurrence()) ? 7 : 1));
            todoRepository.save(next);
        }
        return response;
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = getUser(email);
        Todo todo = getTodo(id, user);
        subTaskRepository.deleteByTodo(todo);
        todoRepository.delete(todo);
    }

    private void applyRequest(Todo todo, TodoRequest req, User user) {
        todo.setTitle(req.getTitle());
        todo.setContent(req.getContent());
        todo.setDeadline(req.getDeadline());
        todo.setRecurrence(ALLOWED_RECURRENCE.contains(req.getRecurrence()) ? req.getRecurrence() : null);
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUser(req.getCategoryId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
            todo.setCategory(category);
        } else {
            todo.setCategory(null);
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }

    private Todo getTodo(Long id, User user) {
        return todoRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Todo를 찾을 수 없습니다."));
    }
}
