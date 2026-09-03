package com.mysite.todo.domain.user;

import com.mysite.todo.common.ApiResponse;
import com.mysite.todo.domain.user.dto.ChangePasswordRequest;
import com.mysite.todo.domain.user.dto.DeleteAccountRequest;
import com.mysite.todo.domain.user.dto.UpdateAutoCleanupRequest;
import com.mysite.todo.domain.user.dto.UpdateNicknameRequest;
import com.mysite.todo.domain.user.dto.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userProfileService.getProfile(userDetails.getUsername())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateNickname(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateNicknameRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                userProfileService.updateNickname(userDetails.getUsername(), req), "닉네임 변경 성공"));
    }

    @PostMapping("/profile-image")
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(
                userProfileService.uploadProfileImage(userDetails.getUsername(), file), "프로필 이미지 업로드 성공"));
    }

    @GetMapping("/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userProfileService.getProfileImageOwned(userDetails.getUsername());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getProfileImageType()))
                .header("Cache-Control", "private, max-age=86400")
                .body(user.getProfileImageData());
    }

    @DeleteMapping("/profile-image")
    public ResponseEntity<ApiResponse<UserProfileResponse>> deleteProfileImage(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                userProfileService.deleteProfileImage(userDetails.getUsername()), "프로필 이미지 삭제 성공"));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest req) {
        userProfileService.changePassword(userDetails.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호 변경 성공"));
    }

    @PutMapping("/auto-cleanup")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAutoCleanup(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateAutoCleanupRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                userProfileService.updateAutoCleanup(userDetails.getUsername(), req), "자동 정리 설정 변경 성공"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DeleteAccountRequest req) {
        userProfileService.deleteAccount(userDetails.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok(null, "계정 삭제 성공"));
    }
}
