package com.mysite.todo.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateNicknameRequest {
    @Size(max = 50)
    private String nickname;
}
