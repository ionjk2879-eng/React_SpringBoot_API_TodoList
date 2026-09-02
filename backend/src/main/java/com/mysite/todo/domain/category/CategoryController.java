package com.mysite.todo.domain.category;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.domain.category.dto.CategoryRequest;
import com.mysite.todo.domain.category.dto.CategoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAll(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.create(userDetails.getUsername(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(userDetails.getUsername(), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        categoryService.delete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(null, "삭제 성공"));
    }
}
