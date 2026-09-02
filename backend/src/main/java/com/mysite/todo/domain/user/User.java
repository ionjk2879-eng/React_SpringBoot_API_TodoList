package com.mysite.todo.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String nickname;

    @Lob
    @Column(length = 1_000_000)
    private byte[] profileImageData;

    @Column(length = 50)
    private String profileImageType;

    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
