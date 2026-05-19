package org.example.service;

import org.example.model.Comment;
import org.example.model.Ticket;
import org.example.model.TicketStatus;
import org.example.model.User;
import org.example.repository.CommentRepository;
import org.example.repository.TicketRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final org.example.repository.NotificationRepository notificationRepository;
    private final org.example.repository.AuditLogRepository auditLogRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    @Autowired
    public TicketService(TicketRepository ticketRepository, CommentRepository commentRepository, UserRepository userRepository, org.example.repository.NotificationRepository notificationRepository, org.example.repository.AuditLogRepository auditLogRepository, org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate, EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
    }

    public Ticket createTicket(Long customerId, String title, String description, org.example.model.Priority priority, org.example.model.Category category, String attachmentUrl) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        java.time.LocalDateTime slaDeadline = null;
        if (priority != null) {
            switch (priority) {
                case URGENT:
                    slaDeadline = java.time.LocalDateTime.now().plusHours(24);
                    break;
                case HIGH:
                    slaDeadline = java.time.LocalDateTime.now().plusHours(48);
                    break;
                case MEDIUM:
                    slaDeadline = java.time.LocalDateTime.now().plusDays(3);
                    break;
                case LOW:
                    slaDeadline = java.time.LocalDateTime.now().plusDays(5);
                    break;
            }
        } else {
            slaDeadline = java.time.LocalDateTime.now().plusDays(3); // default MEDIUM
        }

        Ticket ticket = new Ticket(title, description, customer, priority, category, slaDeadline, attachmentUrl);
        
        // Phase 1: Auto-Routing Logic
        org.springframework.data.domain.Page<User> leastBusyAgents = userRepository.findAgentWithLeastWorkload(
            org.springframework.data.domain.PageRequest.of(0, 1)
        );
        
        if (leastBusyAgents.hasContent()) {
            User assignedAgent = leastBusyAgents.getContent().get(0);
            ticket.setAgent(assignedAgent);
            
            // Notify the assigned agent
            org.example.model.Notification notif = new org.example.model.Notification(
                assignedAgent, 
                "You have been auto-assigned to new Ticket: " + ticket.getTitle()
            );
            notificationRepository.save(notif);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Audit Log
        auditLogRepository.save(new org.example.model.AuditLog(savedTicket, customer, "Ticket created"));
        if (savedTicket.getAgent() != null) {
            auditLogRepository.save(new org.example.model.AuditLog(savedTicket, null, "System auto-assigned to " + savedTicket.getAgent().getName()));
        }

        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByCustomer(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return ticketRepository.findByCustomer(customer);
    }

    public List<Ticket> getTicketsByAgent(Long agentId) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return ticketRepository.findByAgent(agent);
    }

    public org.springframework.data.domain.Page<Ticket> getPaginatedTicketsByAgent(Long agentId, org.springframework.data.domain.Pageable pageable) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        // Pending means OPEN or IN_PROGRESS
        return ticketRepository.findByAgentAndStatusIn(agent, 
            List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), pageable);
    }

    public org.springframework.data.domain.Page<Ticket> getPaginatedHistoryByAgent(Long agentId, org.springframework.data.domain.Pageable pageable) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        // History means RESOLVED or CLOSED
        return ticketRepository.findByAgentAndStatusIn(agent, 
            List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED), pageable);
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket assignAgent(Long ticketId, Long agentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        
        ticket.setAgent(agent);
        Ticket saved = ticketRepository.save(ticket);
        
        // Notify the agent
        org.example.model.Notification notif = new org.example.model.Notification(agent, "You have been assigned to Ticket #" + ticket.getId() + ": " + ticket.getTitle());
        notificationRepository.save(notif);
        
        // Audit Log
        auditLogRepository.save(new org.example.model.AuditLog(saved, null, "Ticket assigned to " + agent.getName()));
        
        return saved;
    }

    public Ticket updateTicketStatus(Long ticketId, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        String oldStatus = ticket.getStatus().name();
        ticket.setStatus(status);
        Ticket saved = ticketRepository.save(ticket);
        
        // Audit Log
        auditLogRepository.save(new org.example.model.AuditLog(saved, null, "Status changed from " + oldStatus + " to " + status.name()));
        
        // Send Email if resolved
        if (status == TicketStatus.RESOLVED && saved.getCustomer() != null && saved.getCustomer().getEmail() != null) {
            emailService.sendTicketResolvedEmail(saved.getCustomer().getEmail(), saved.getId(), saved.getTitle());
        }
        
        return saved;
    }

    public Comment addComment(Long ticketId, Long userId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment(ticket, user, content);
        Comment saved = commentRepository.save(comment);
        
        // Notification Logic
        if ("CUSTOMER".equals(user.getRole().name()) && ticket.getAgent() != null) {
            // Notify Agent
            notificationRepository.save(new org.example.model.Notification(ticket.getAgent(), "Customer added a comment to Ticket #" + ticket.getId()));
        } else if ("AGENT".equals(user.getRole().name())) {
            // Notify Customer
            notificationRepository.save(new org.example.model.Notification(ticket.getCustomer(), "Agent added a comment to your Ticket #" + ticket.getId()));
        }
        
        // Broadcast new comment to subscribers
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, saved);
        
        return saved;
    }

    public List<Comment> getCommentsForTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }

    public List<Ticket> searchTickets(Long userId, String role, String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        
        if ("ADMIN".equals(role)) {
            return ticketRepository.searchAll(query);
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if ("AGENT".equals(role)) {
            return ticketRepository.searchByAgent(user, query);
        } else {
            return ticketRepository.searchByCustomer(user, query);
        }
    }
}
