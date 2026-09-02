package com.mysite.todo.domain.category;

import com.mysite.todo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserOrderByCreatedAtAsc(User user);
    Optional<Category> findByIdAndUser(Long id, User user);
    boolean existsByIdAndUser(Long id, User user);
}
