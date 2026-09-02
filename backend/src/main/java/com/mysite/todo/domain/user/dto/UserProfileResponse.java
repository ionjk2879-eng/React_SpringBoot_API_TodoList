package com.mysite.todo.domain.user.dto;

import com.mysite.todo.domain.user.User;
import lombok.Getter;

@Getter
public class UserProfileResponse {
    private final String email;
    private final String nickname;
    private final boolean hasProfileImage;

    public UserProfileResponse(User user) {
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.hasProfileImage = user.getProfileImageData() != null;
    }
}
