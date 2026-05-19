package org.example.controller;

import org.example.model.Comment;
import org.example.model.Ticket;
import org.example.model.TicketStatus;
import org.example.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequest request) {
        Ticket ticket = ticketService.createTicket(
            request.getCustomerId(), 
            request.getTitle(), 
            request.getDescription(),
            request.getPriority(),
            request.getCategory(),
            request.getAttachmentUrl()
        );
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Ticket>> getTicketsByCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketsByCustomer(id));
    }

    @GetMapping("/agent/{id}")
    public ResponseEntity<List<Ticket>> getTicketsByAgent(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketsByAgent(id));
    }

    @GetMapping("/agent/{id}/pending")
    public ResponseEntity<org.springframework.data.domain.Page<Ticket>> getPendingTicketsByAgent(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(ticketService.getPaginatedTicketsByAgent(id, pageable));
    }

    @GetMapping("/agent/{id}/history")
    public ResponseEntity<org.springframework.data.domain.Page<Ticket>> getHistoryTicketsByAgent(
            @PathVariable Long id, 
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(ticketService.getPaginatedHistoryByAgent(id, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ticket>> searchTickets(
            @RequestParam String query,
            @RequestParam Long userId,
            @RequestParam String role) {
        return ResponseEntity.ok(ticketService.searchTickets(userId, role, query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignAgent(@PathVariable Long id, @RequestBody AgentRequest request) {
        Ticket ticket = ticketService.assignAgent(id, request.getAgentId());
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        Ticket ticket = ticketService.updateTicketStatus(id, request.getStatus());
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        Comment comment = ticketService.addComment(id, request.getUserId(), request.getContent());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsForTicket(id));
    }

    // DTO Classes
    public static class TicketRequest {
        @NotNull
        private Long customerId;
        @NotBlank
        private String title;
        @NotBlank
        private String description;
        
        private org.example.model.Priority priority;
        private org.example.model.Category category;
        private String attachmentUrl;

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public org.example.model.Priority getPriority() { return priority; }
        public void setPriority(org.example.model.Priority priority) { this.priority = priority; }
        public org.example.model.Category getCategory() { return category; }
        public void setCategory(org.example.model.Category category) { this.category = category; }
        public String getAttachmentUrl() { return attachmentUrl; }
        public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    }

    public static class AgentRequest {
        private Long agentId;
        public Long getAgentId() { return agentId; }
        public void setAgentId(Long agentId) { this.agentId = agentId; }
    }

    public static class StatusRequest {
        private TicketStatus status;
        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
    }

    public static class CommentRequest {
        @NotNull
        private Long userId;
        @NotBlank
        private String content;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
