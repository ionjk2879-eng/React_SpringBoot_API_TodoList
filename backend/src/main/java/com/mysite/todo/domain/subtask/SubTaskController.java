package com.mysite.todo.domain.subtask;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.domain.subtask.dto.SubTaskRequest;
import com.mysite.todo.domain.subtask.dto.SubTaskResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubTaskController {

    private final SubTaskService subTaskService;

    @GetMapping("/api/todos/{todoId}/subtasks")
    public ResponseEntity<ApiResponse<List<SubTaskResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long todoId) {
        return ResponseEntity.ok(ApiResponse.ok(subTaskService.getForTodo(userDetails.getUsername(), todoId)));
    }

    @PostMapping("/api/todos/{todoId}/subtasks")
    public ResponseEntity<ApiResponse<SubTaskResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long todoId,
            @Valid @RequestBody SubTaskRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                subTaskService.create(userDetails.getUsername(), todoId, req), "하위 할 일 추가 성공"));
    }

    @PatchMapping("/api/subtasks/{id}/toggle")
    public ResponseEntity<ApiResponse<SubTaskResponse>> toggle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(subTaskService.toggle(userDetails.getUsername(), id)));
    }

    @DeleteMapping("/api/subtasks/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        subTaskService.delete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(null, "삭제 성공"));
    }
}
