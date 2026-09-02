package com.mysite.todo.domain.todo.dto;

import com.mysite.todo.domain.todo.Todo;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TodoResponse {
    private final Long id;
    private final String title;
    private final String content;
    private final LocalDateTime deadline;
    private final boolean completed;
    private final Long categoryId;
    private final String categoryName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public TodoResponse(Todo todo) {
        this.id = todo.getId();
        this.title = todo.getTitle();
        this.content = todo.getContent();
        this.deadline = todo.getDeadline();
        this.completed = todo.isCompleted();
        this.categoryId = todo.getCategory() != null ? todo.getCategory().getId() : null;
        this.categoryName = todo.getCategory() != null ? todo.getCategory().getName() : null;
        this.createdAt = todo.getCreatedAt();
        this.updatedAt = todo.getUpdatedAt();
    }
}
