package com.mysite.todo.domain.category;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.domain.category.dto.CategoryRequest;
import com.mysite.todo.domain.category.dto.CategoryResponse;
import com.mysite.todo.domain.category.dto.ReorderCategoriesRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<CategoryResponse>> togglePin(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.togglePin(userDetails.getUsername(), id)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleArchive(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.toggleArchive(userDetails.getUsername(), id)));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReorderCategoriesRequest req) {
        categoryService.reorder(userDetails.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok(null, "순서 변경 성공"));
    }

    @PostMapping("/{id}/stamp-image")
    public ResponseEntity<ApiResponse<CategoryResponse>> uploadStampImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(
                categoryService.uploadStampImage(userDetails.getUsername(), id, file), "도장 이미지 업로드 성공"));
    }

    @GetMapping("/{id}/stamp-image")
    public ResponseEntity<byte[]> getStampImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Category category = categoryService.getStampImageOwned(userDetails.getUsername(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(category.getStampImageType()))
                .header("Cache-Control", "private, max-age=86400")
                .body(category.getStampImageData());
    }

    @DeleteMapping("/{id}/stamp-image")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteStampImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                categoryService.deleteStampImage(userDetails.getUsername(), id), "도장 이미지 삭제 성공"));
    }
}
