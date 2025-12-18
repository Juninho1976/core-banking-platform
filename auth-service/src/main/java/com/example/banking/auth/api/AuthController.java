package com.example.banking.auth.api;

import com.example.banking.auth.user.User;
import com.example.banking.auth.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.banking.auth.api.InvalidCredentialsException;
import com.example.banking.auth.jwt.JwtService;
import org.springframework.security.core.Authentication;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User saved = userRepository.save(new User(email, passwordHash));

        return new RegisterResponse(saved.getId(), saved.getEmail());
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {

        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
            .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }   

        String token = jwtService.createToken(user.getId(), user.getEmail());
        return new LoginResponse(token, "Bearer", 3600);

    }

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        return new MeResponse(auth.getName());
    }

}
