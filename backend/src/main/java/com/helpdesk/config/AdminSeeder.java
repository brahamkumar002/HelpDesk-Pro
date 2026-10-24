
package com.helpdesk.config;

import com.helpdesk.entity.User;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.full-name:HelpDesk Admin}")
    private String adminFullName;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {

            System.out.println(
                    "ADMIN SEED SKIPPED: Admin credentials not configured."
            );
            return;
        }

        String email = adminEmail.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            System.out.println(
                    "ADMIN SEED SKIPPED: Account already exists."
            );
            return;
        }

        if (adminPassword.length() < 8) {
            throw new IllegalStateException(
                    "Admin seed password must contain at least 12 characters."
            );
        }

        User admin = new User();

        admin.setFullName(adminFullName.trim());
        admin.setEmail(email);
        admin.setPasswordHash(
                passwordEncoder.encode(adminPassword)
        );
        admin.setRole(User.Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);

        System.out.println(
                "ADMIN SEED SUCCESS: Default admin account created."
        );
    }
}
