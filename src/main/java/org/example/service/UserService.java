package org.example.service;

import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final org.example.repository.TicketRepository ticketRepository;
    private final org.example.repository.CommentRepository commentRepository;
    private final org.example.repository.NotificationRepository notificationRepository;
    private final org.example.repository.AuditLogRepository auditLogRepository;

    @Autowired
    public UserService(UserRepository userRepository, org.example.repository.TicketRepository ticketRepository, org.example.repository.CommentRepository commentRepository, org.example.repository.NotificationRepository notificationRepository, org.example.repository.AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void hardDeleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // 1. Delete all audit logs involving the user
        auditLogRepository.deleteByActorId(id);
        
        // 2. Delete all comments by the user
        commentRepository.deleteByUserId(id);
        
        // 3. Delete all notifications for the user
        notificationRepository.deleteByUserId(id);
        
        // 4. Handle tickets
        // Unassign if they are an agent on any tickets
        java.util.List<org.example.model.Ticket> assignedTickets = ticketRepository.findByAgent(user);
        for (org.example.model.Ticket t : assignedTickets) {
            t.setAgent(null);
            ticketRepository.save(t);
        }
        
        // Delete tickets they created as a customer
        java.util.List<org.example.model.Ticket> customerTickets = ticketRepository.findByCustomer(user);
        for (org.example.model.Ticket t : customerTickets) {
            auditLogRepository.deleteByTicketId(t.getId());
            commentRepository.deleteByTicketId(t.getId());
            ticketRepository.delete(t);
        }
        
        // 5. Delete the user
        userRepository.deleteById(id);
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.isActive()) {
                throw new RuntimeException("Account is disabled");
            }
            if (user.getPassword() != null && user.getPassword().equals(password)) {
                return user;
            }
        }
        throw new RuntimeException("Invalid email or password");
    }

    public User updateUserRole(Long id, org.example.model.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }
}
