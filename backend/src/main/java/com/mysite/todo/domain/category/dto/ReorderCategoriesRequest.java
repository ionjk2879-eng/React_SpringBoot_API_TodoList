package com.mysite.todo.domain.category.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class ReorderCategoriesRequest {
    @NotEmpty
    private List<Long> orderedIds;
}
