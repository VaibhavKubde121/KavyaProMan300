package com.team1.backend.service;

import com.team1.backend.dto.AuthResponse;
import com.team1.backend.dto.LoginRequest;
import com.team1.backend.dto.RegisterRequest;
import com.team1.backend.model.User;
import com.team1.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return new AuthResponse(false, "Email already in use");
        }
        String hashed = passwordEncoder.encode(req.getPassword());
        User user = new User(req.getName(), req.getEmail(), hashed);
        userRepository.save(user);
        return new AuthResponse(true, "Registered successfully", user.getId(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        Optional<User> u = userRepository.findByEmail(req.getEmail());
        if (u.isEmpty()) {
            return new AuthResponse(false, "Invalid credentials");
        }
        User user = u.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return new AuthResponse(false, "Invalid credentials");
        }
        return new AuthResponse(true, "Login successful", user.getId(), user.getEmail());
    }
}
