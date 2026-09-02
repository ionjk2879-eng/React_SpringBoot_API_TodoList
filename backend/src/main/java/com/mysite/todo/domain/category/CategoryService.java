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

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

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
        category.setUser(user);
        return new CategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(String email, Long id, CategoryRequest req) {
        User user = getUser(email);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.setName(req.getName());
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
