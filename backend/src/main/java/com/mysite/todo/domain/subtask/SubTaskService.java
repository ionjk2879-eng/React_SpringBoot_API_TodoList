package com.mysite.todo.domain.subtask;

import com.mysite.todo.domain.subtask.dto.SubTaskRequest;
import com.mysite.todo.domain.subtask.dto.SubTaskResponse;
import com.mysite.todo.domain.todo.Todo;
import com.mysite.todo.domain.todo.TodoRepository;
import com.mysite.todo.domain.user.User;
import com.mysite.todo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubTaskService {

    private final SubTaskRepository subTaskRepository;
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public List<SubTaskResponse> getForTodo(String email, Long todoId) {
        User user = getUser(email);
        Todo todo = getTodo(todoId, user);
        return subTaskRepository.findByTodoOrderByCreatedAtAsc(todo).stream().map(SubTaskResponse::new).toList();
    }

    @Transactional
    public SubTaskResponse create(String email, Long todoId, SubTaskRequest req) {
        User user = getUser(email);
        Todo todo = getTodo(todoId, user);
        SubTask subTask = new SubTask();
        subTask.setTodo(todo);
        subTask.setTitle(req.getTitle());
        return new SubTaskResponse(subTaskRepository.save(subTask));
    }

    @Transactional
    public SubTaskResponse toggle(String email, Long id) {
        User user = getUser(email);
        SubTask subTask = getOwned(id, user);
        subTask.setCompleted(!subTask.isCompleted());
        return new SubTaskResponse(subTaskRepository.save(subTask));
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = getUser(email);
        SubTask subTask = getOwned(id, user);
        subTaskRepository.delete(subTask);
    }

    private SubTask getOwned(Long id, User user) {
        return subTaskRepository.findByIdAndTodo_User(id, user)
                .orElseThrow(() -> new IllegalArgumentException("하위 할 일을 찾을 수 없습니다."));
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
