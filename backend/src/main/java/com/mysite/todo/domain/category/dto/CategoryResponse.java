package com.mysite.todo.domain.category.dto;

import com.mysite.todo.domain.category.Category;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CategoryResponse {
    private final Long id;
    private final String name;
    private final String stampShape;
    private final boolean hasCustomStamp;
    private final String color;
    private final boolean pinned;
    private final boolean archived;
    private final long todoCount;
    private final LocalDateTime createdAt;

    public CategoryResponse(Category category, long todoCount) {
        this.id = category.getId();
        this.name = category.getName();
        this.stampShape = category.getStampShape();
        this.hasCustomStamp = category.getStampImageData() != null;
        this.color = category.getColor();
        this.pinned = category.isPinned();
        this.archived = category.isArchived();
        this.todoCount = todoCount;
        this.createdAt = category.getCreatedAt();
    }
}
