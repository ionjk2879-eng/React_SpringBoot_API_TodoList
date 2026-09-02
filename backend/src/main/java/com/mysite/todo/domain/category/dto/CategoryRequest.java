package com.mysite.todo.domain.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CategoryRequest {
    @NotBlank
    private String name;
}
