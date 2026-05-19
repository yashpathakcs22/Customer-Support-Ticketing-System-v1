package org.example.controller;

import org.example.model.AuditLog;
import org.example.model.Ticket;
import org.example.repository.AuditLogRepository;
import org.example.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final TicketRepository ticketRepository;

    @Autowired
    public AuditLogController(AuditLogRepository auditLogRepository, TicketRepository ticketRepository) {
        this.auditLogRepository = auditLogRepository;
        this.ticketRepository = ticketRepository;
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<AuditLog>> getLogsForTicket(@PathVariable Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return ResponseEntity.ok(auditLogRepository.findByTicketOrderByTimestampDesc(ticket));
    }
}
