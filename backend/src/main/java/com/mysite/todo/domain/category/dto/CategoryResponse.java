package com.mysite.todo.domain.category.dto;

import com.mysite.todo.domain.category.Category;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CategoryResponse {
    private final Long id;
    private final String name;
    private final LocalDateTime createdAt;

    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.createdAt = category.getCreatedAt();
    }
}
