package com.mysite.todo.domain.todo;

import com.mysite.todo.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    Page<Todo> findByUser(User user, Pageable pageable);

    Page<Todo> findByUserAndCategoryId(User user, Long categoryId, Pageable pageable);

    Optional<Todo> findByIdAndUser(Long id, User user);

    long deleteByUser(User user);

    @Modifying
    @Query("UPDATE Todo t SET t.category = null WHERE t.category.id = :categoryId AND t.user = :user")
    void detachCategory(@Param("categoryId") Long categoryId, @Param("user") User user);
}
