package com.mysite.todo.domain.todo;

import com.mysite.todo.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    Page<Todo> findByUserAndDeletedAtIsNull(User user, Pageable pageable);

    Page<Todo> findByUserAndCategoryIdAndDeletedAtIsNull(User user, Long categoryId, Pageable pageable);

    long countByUserAndCategoryIdAndDeletedAtIsNull(User user, Long categoryId);

    List<Todo> findByUserAndDeletedAtIsNotNullOrderByDeletedAtDesc(User user);

    Optional<Todo> findByIdAndUserAndDeletedAtIsNull(Long id, User user);

    Optional<Todo> findByIdAndUserAndDeletedAtIsNotNull(Long id, User user);

    List<Todo> findByUserAndCompletedTrueAndCompletedAtBefore(User user, LocalDateTime cutoff);

    List<Todo> findByDeletedAtBefore(LocalDateTime cutoff);

    long deleteByUser(User user);

    @Modifying
    @Query("UPDATE Todo t SET t.category = null WHERE t.category.id = :categoryId AND t.user = :user")
    void detachCategory(@Param("categoryId") Long categoryId, @Param("user") User user);
}
