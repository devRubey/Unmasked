package com.example.chessinsights.controller;

import com.example.chessinsights.model.User;
import com.example.chessinsights.repository.UserRepository;
import com.example.chessinsights.service.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.username).isPresent()) {
            throw new RuntimeException("Username already taken");
        }

        String hashedPassword = passwordEncoder.encode(request.password);
        User user = new User(request.username, request.email, hashedPassword);
        userRepository.save(user);

        return "User registered successfully";
    }

    // Simple inner class to receive the JSON request body
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
    }

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        return jwtService.generateToken(user.getUsername());
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }
}