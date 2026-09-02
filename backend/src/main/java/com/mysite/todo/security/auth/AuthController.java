package com.mysite.todo.security.auth;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.security.auth.dto.LoginRequest;
import com.mysite.todo.security.auth.dto.RegisterRequest;
import com.mysite.todo.security.auth.dto.TokenResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private static final String REFRESH_COOKIE = "refreshToken";
    private static final int REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7일(초)

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletResponse response) {
        TokenResponse tokens = authService.register(req);
        setRefreshCookie(response, authService.getRefreshTokenForUser(tokens.getEmail()));
        return ResponseEntity.ok(ApiResponse.ok(tokens, "회원가입 성공"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response) {
        TokenResponse tokens = authService.login(req);
        setRefreshCookie(response, authService.getRefreshTokenForUser(tokens.getEmail()));
        return ResponseEntity.ok(ApiResponse.ok(tokens, "로그인 성공"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Refresh Token이 없습니다."));
        }
        TokenResponse tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response) {
        authService.logout(userDetails.getUsername());
        clearRefreshCookie(response);
        return ResponseEntity.ok(ApiResponse.ok(null, "로그아웃 성공"));
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(REFRESH_MAX_AGE);
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
