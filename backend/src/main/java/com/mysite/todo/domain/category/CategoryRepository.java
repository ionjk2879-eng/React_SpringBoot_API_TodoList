package com.mysite.todo.domain.category;

import com.mysite.todo.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.user = :user ORDER BY c.archived ASC, c.pinned DESC, c.sortOrder ASC, c.createdAt ASC")
    List<Category> findAllOrdered(@Param("user") User user);

    Optional<Category> findByIdAndUser(Long id, User user);
    boolean existsByIdAndUser(Long id, User user);
    long countByUser(User user);
    long deleteByUser(User user);
}
