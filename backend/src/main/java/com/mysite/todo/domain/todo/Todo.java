package com.mysite.todo.domain.todo;

import com.mysite.todo.domain.category.Category;
import com.mysite.todo.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "todos",
    indexes = {
        @Index(name = "idx_todo_user_id",      columnList = "user_id"),
        @Index(name = "idx_todo_user_created", columnList = "user_id, created_at")
    }
)
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Todo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // @Lob 대신 TEXT 명시: H2(CLOB alias) / MySQL(TEXT) 모두 호환
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime deadline;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(length = 20)
    private String recurrence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
