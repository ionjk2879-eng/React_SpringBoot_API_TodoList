package com.mysite.todo.domain.user;

import com.mysite.todo.domain.category.CategoryRepository;
import com.mysite.todo.domain.subtask.SubTaskRepository;
import com.mysite.todo.domain.todo.TodoRepository;
import com.mysite.todo.domain.user.dto.ChangePasswordRequest;
import com.mysite.todo.domain.user.dto.DeleteAccountRequest;
import com.mysite.todo.domain.user.dto.UpdateAccentColorRequest;
import com.mysite.todo.domain.user.dto.UpdateAutoCleanupRequest;
import com.mysite.todo.domain.user.dto.UpdateNicknameRequest;
import com.mysite.todo.domain.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_IMAGE_BYTES = 800_000;
    private static final Set<String> ALLOWED_ACCENT_COLORS =
            Set.of("orange", "green", "blue", "red", "purple", "pink", "teal");

    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final CategoryRepository categoryRepository;
    private final SubTaskRepository subTaskRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(String email) {
        return new UserProfileResponse(getUser(email));
    }

    @Transactional
    public UserProfileResponse updateNickname(String email, UpdateNicknameRequest req) {
        User user = getUser(email);
        String nickname = req.getNickname();
        user.setNickname(nickname == null || nickname.isBlank() ? null : nickname.trim());
        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse uploadProfileImage(String email, MultipartFile file) {
        User user = getUser(email);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("PNG, JPEG, WEBP 이미지만 업로드할 수 있습니다.");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("이미지 용량은 800KB 이하여야 합니다.");
        }
        try {
            user.setProfileImageData(file.getBytes());
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지를 읽지 못했습니다.");
        }
        user.setProfileImageType(file.getContentType());
        return new UserProfileResponse(userRepository.save(user));
    }

    public User getProfileImageOwned(String email) {
        User user = getUser(email);
        if (user.getProfileImageData() == null) {
            throw new IllegalArgumentException("프로필 이미지가 없습니다.");
        }
        return user;
    }

    @Transactional
    public UserProfileResponse deleteProfileImage(String email) {
        User user = getUser(email);
        user.setProfileImageData(null);
        user.setProfileImageType(null);
        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = getUser(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("현재 비밀번호가 일치하지 않습니다.");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse updateAutoCleanup(String email, UpdateAutoCleanupRequest req) {
        User user = getUser(email);
        Integer days = req.getDays();
        user.setAutoCleanupDays(days != null && days > 0 ? days : null);
        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse updateAccentColor(String email, UpdateAccentColorRequest req) {
        User user = getUser(email);
        String color = req.getColor();
        user.setAccentColor(color != null && ALLOWED_ACCENT_COLORS.contains(color) ? color : null);
        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteAccount(String email, DeleteAccountRequest req) {
        User user = getUser(email);
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }
        subTaskRepository.deleteByTodo_User(user);
        todoRepository.deleteByUser(user);
        categoryRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
