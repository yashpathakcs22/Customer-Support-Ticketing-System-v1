package org.example;

import org.example.model.Role;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, org.example.repository.ArticleRepository articleRepository) {
        return args -> {
            if (userRepository.findAll().stream().noneMatch(u -> u.getRole() == Role.ADMIN)) {
                User admin = new User("System Admin", "admin@example.com", "admin123", Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Default Admin seeded: admin@example.com / admin123");
            }
            
            if (articleRepository.count() == 0) {
                articleRepository.save(new org.example.model.Article("How to reset password", "If you forgot your password, click on the 'Forgot Password' link on the login page and follow the instructions sent to your email.", "login, password, reset"));
                articleRepository.save(new org.example.model.Article("System is slow or lagging", "If the system is running slowly, try clearing your browser cache or switching to a modern browser like Chrome or Firefox. If the issue persists, check our status page.", "performance, slow, lag, bug"));
                articleRepository.save(new org.example.model.Article("Billing and Invoice Questions", "To view your invoices, navigate to the Billing section in your profile. You can download PDF copies of past invoices there.", "billing, invoice, payment"));
                System.out.println("Seeded Knowledge Base articles");
            }
        };
    }
}
