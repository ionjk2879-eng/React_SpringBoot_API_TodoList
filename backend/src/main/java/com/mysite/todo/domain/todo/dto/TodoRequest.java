package com.mysite.todo.domain.todo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TodoRequest {
    @NotBlank
    private String title;

    private String content;

    private LocalDateTime deadline;

    private Long categoryId;
}
