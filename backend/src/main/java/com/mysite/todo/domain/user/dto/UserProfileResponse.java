package com.mysite.todo.domain.user.dto;

import com.mysite.todo.domain.user.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponse {
    private final String email;
    private final String nickname;
    private final boolean hasProfileImage;
    private final Integer autoCleanupDays;
    private final LocalDateTime createdAt;

    public UserProfileResponse(User user) {
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.hasProfileImage = user.getProfileImageData() != null;
        this.autoCleanupDays = user.getAutoCleanupDays();
        this.createdAt = user.getCreatedAt();
    }
}
