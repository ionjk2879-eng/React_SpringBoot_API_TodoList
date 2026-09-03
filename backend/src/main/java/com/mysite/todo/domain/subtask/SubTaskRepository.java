package com.mysite.todo.domain.subtask;

import com.mysite.todo.domain.todo.Todo;
import com.mysite.todo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {

    List<SubTask> findByTodoOrderByCreatedAtAsc(Todo todo);

    Optional<SubTask> findByIdAndTodo_User(Long id, User user);

    long deleteByTodo(Todo todo);
}
