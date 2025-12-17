package com.example.banking.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // For now, disable CSRF because we’re building a stateless API.
            // (We’ll tighten things when we introduce JWT.)
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health").permitAll()
                .anyRequest().authenticated()
            )
            // Temporary: keep Basic Auth enabled for now (Spring’s default).
            // We’ll replace this with JWT soon.
            .httpBasic(basic -> {});

        return http.build();
    }
}
