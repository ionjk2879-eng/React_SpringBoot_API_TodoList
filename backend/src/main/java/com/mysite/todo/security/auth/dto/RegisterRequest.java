package com.mysite.todo.security.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class RegisterRequest {
    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;
}
