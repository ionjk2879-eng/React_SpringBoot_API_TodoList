package com.mysite.todo.domain.category;

import com.mysite.todo.domain.category.dto.CategoryRequest;
import com.mysite.todo.domain.category.dto.CategoryResponse;
import com.mysite.todo.domain.todo.TodoRepository;
import com.mysite.todo.domain.user.User;
import com.mysite.todo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final Set<String> ALLOWED_STAMP_SHAPES =
            Set.of("circle", "star", "heart", "check", "square", "wave", "custom");
    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_IMAGE_BYTES = 800_000;

    private final CategoryRepository categoryRepository;
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    private String resolveStampShape(String requested) {
        return (requested != null && ALLOWED_STAMP_SHAPES.contains(requested)) ? requested : "circle";
    }

    public List<CategoryResponse> getAll(String email) {
        User user = getUser(email);
        return categoryRepository.findByUserOrderByCreatedAtAsc(user)
                .stream().map(CategoryResponse::new).toList();
    }

    @Transactional
    public CategoryResponse create(String email, CategoryRequest req) {
        User user = getUser(email);
        Category category = new Category();
        category.setName(req.getName());
        category.setStampShape(resolveStampShape(req.getStampShape()));
        category.setUser(user);
        return new CategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(String email, Long id, CategoryRequest req) {
        User user = getUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.setName(req.getName());
        category.setStampShape(resolveStampShape(req.getStampShape()));
        return new CategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse uploadStampImage(String email, Long id, MultipartFile file) {
        User user = getUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("PNG, JPEG, WEBP 이미지만 업로드할 수 있습니다.");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("이미지 용량은 800KB 이하여야 합니다.");
        }
        try {
            category.setStampImageData(file.getBytes());
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지를 읽지 못했습니다.");
        }
        category.setStampImageType(file.getContentType());
        category.setStampShape("custom");
        return new CategoryResponse(categoryRepository.save(category));
    }

    public Category getStampImageOwned(String email, Long id) {
        User user = getUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        if (category.getStampImageData() == null) {
            throw new IllegalArgumentException("커스텀 도장 이미지가 없습니다.");
        }
        return category;
    }

    @Transactional
    public CategoryResponse deleteStampImage(String email, Long id) {
        User user = getUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.setStampImageData(null);
        category.setStampImageType(null);
        category.setStampShape("circle");
        return new CategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = getUser(email);
        if (!categoryRepository.existsByIdAndUser(id, user)) {
            throw new IllegalArgumentException("카테고리를 찾을 수 없습니다.");
        }
        todoRepository.detachCategory(id, user);
        categoryRepository.deleteById(id);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
