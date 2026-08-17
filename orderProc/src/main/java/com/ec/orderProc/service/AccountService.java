package com.ec.orderProc.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ec.orderProc.exception.FileTooLargeException;
import com.ec.orderProc.exception.InvalidFileTypeException;
import com.ec.orderProc.model.User;
import com.ec.orderProc.payload.AccountResponse;
import com.ec.orderProc.payload.UpdateAccountRequest;
import com.ec.orderProc.repo.UserRepository;

@Service
public class AccountService {

    private final UserRepository userRepository;

    public AccountService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AccountResponse getAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AccountResponse.from(user);
    }

    public AccountResponse updateAccount(UUID userId, UpdateAccountRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("USer not found"));

        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        User updatedUser = userRepository.save(user);
        return AccountResponse.from(updatedUser);
    }

    public void uploadProfilePicture(UUID userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new InvalidFileTypeException();
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new FileTooLargeException();
        }

        byte[] bytes = file.getBytes();
        if (!isValidImage(bytes)) {
            throw new InvalidFileTypeException();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePicture(bytes);
        user.setProfilePictureContentType(file.getContentType());
        userRepository.save(user);
    }

    private boolean isValidImage(byte[] bytes) {
        if (bytes.length < 8)
            return false;

        // PNG: 89 50 4E 47
        boolean isPng = (bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        // JPEG: FF D8 FF
        boolean isJpeg = (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF;
        // WEBP: RIFF....WEBP
        boolean isWebp = bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F';

        return isPng || isJpeg || isWebp;
    }

    public User getUserWithPicture(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
