package com.mysite.todo.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class DeleteAccountRequest {
    @NotBlank
    private String password;
}
