package com.mysite.todo.domain.subtask.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SubTaskRequest {
    @NotBlank
    private String title;
}
