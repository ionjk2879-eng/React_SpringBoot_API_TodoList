package com.mysite.todo.security.auth;

import com.mysite.todo.domain.user.User;
import com.mysite.todo.domain.user.UserRepository;
import com.mysite.todo.security.JwtUtil;
import com.mysite.todo.security.auth.dto.LoginRequest;
import com.mysite.todo.security.auth.dto.RegisterRequest;
import com.mysite.todo.security.auth.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new BadCredentialsException("유효하지 않은 Refresh Token입니다.");
        }
        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));
        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new BadCredentialsException("Refresh Token이 일치하지 않습니다.");
        }
        return issueTokens(user);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setRefreshToken(null);
            userRepository.save(u);
        });
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        return new TokenResponse(accessToken, user.getEmail());
    }

    public String getRefreshTokenForUser(String email) {
        return userRepository.findByEmail(email)
                .map(User::getRefreshToken)
                .orElse(null);
    }
}
