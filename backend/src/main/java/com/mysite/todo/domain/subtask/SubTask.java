package com.mysite.todo.domain.subtask;

import com.mysite.todo.domain.todo.Todo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "subtasks",
    indexes = {
        @Index(name = "idx_subtask_todo_id", columnList = "todo_id")
    }
)
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SubTask {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "todo_id", nullable = false)
    private Todo todo;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
