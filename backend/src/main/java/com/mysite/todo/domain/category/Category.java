package com.mysite.todo.domain.category;

import com.mysite.todo.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "categories",
    indexes = {
        @Index(name = "idx_category_user_id", columnList = "user_id")
    }
)
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Category {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String stampShape = "circle";

    @Lob
    @Column(length = 1_000_000)
    private byte[] stampImageData;

    @Column(length = 50)
    private String stampImageType;

    @Column(length = 20)
    private String color;

    @ColumnDefault("0")
    @Column(nullable = false)
    private Integer sortOrder = 0;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean pinned = false;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean archived = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
