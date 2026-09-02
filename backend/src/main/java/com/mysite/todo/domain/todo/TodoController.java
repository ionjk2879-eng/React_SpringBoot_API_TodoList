package com.mysite.todo.domain.todo;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.domain.todo.dto.TodoRequest;
import com.mysite.todo.domain.todo.dto.TodoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TodoResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                todoService.getAll(userDetails.getUsername(), categoryId, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TodoResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TodoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(todoService.create(userDetails.getUsername(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(todoService.update(userDetails.getUsername(), id, req)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TodoResponse>> toggleComplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(todoService.toggleComplete(userDetails.getUsername(), id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        todoService.delete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(null, "삭제 성공"));
    }
}
