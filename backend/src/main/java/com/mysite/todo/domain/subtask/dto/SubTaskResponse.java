package com.mysite.todo.domain.subtask.dto;

import com.mysite.todo.domain.subtask.SubTask;
import lombok.Getter;

@Getter
public class SubTaskResponse {
    private final Long id;
    private final String title;
    private final boolean completed;

    public SubTaskResponse(SubTask subTask) {
        this.id = subTask.getId();
        this.title = subTask.getTitle();
        this.completed = subTask.isCompleted();
    }
}
