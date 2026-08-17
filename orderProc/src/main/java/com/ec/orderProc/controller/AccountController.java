package com.ec.orderProc.controller;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ec.orderProc.model.User;
import com.ec.orderProc.payload.AccountResponse;
import com.ec.orderProc.payload.UpdateAccountRequest;
import com.ec.orderProc.service.AccountService;

@RestController
@RequestMapping("/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<AccountResponse> getAccount(Authentication auth) {
        return ResponseEntity.ok(accountService.getAccount(UUID.fromString(auth.getName())));
    }

    @PutMapping
    public ResponseEntity<AccountResponse> updateAccount(Authentication auth,
            @RequestBody UpdateAccountRequest request) {
        return ResponseEntity.ok(accountService.updateAccount(UUID.fromString(auth.getName()), request));
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<Void> uploadProfilePicture(Authentication auth, @RequestParam("file") MultipartFile file)
            throws IOException {
        accountService.uploadProfilePicture(UUID.fromString(auth.getName()), file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<byte[]> getProfilePicture(Authentication auth) {
        User user = accountService.getUserWithPicture(UUID.fromString(auth.getName()));
        if (user.getProfilePicture() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getProfilePictureContentType()))
                .body(user.getProfilePicture());
    }
}