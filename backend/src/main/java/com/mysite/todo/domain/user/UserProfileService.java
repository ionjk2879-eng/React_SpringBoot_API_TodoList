package com.mysite.todo.domain.user;

import com.mysite.todo.domain.user.dto.UpdateNicknameRequest;
import com.mysite.todo.domain.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

    private final UserRepository userRepository;

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

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
