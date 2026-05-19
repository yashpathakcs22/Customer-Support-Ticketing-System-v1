package org.example.controller;

import org.example.model.Ticket;
import org.example.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final TicketRepository ticketRepository;

    @Autowired
    public AdminController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        List<Ticket> allTickets = ticketRepository.findAll();
        
        long totalTickets = allTickets.size();
        
        Map<String, Long> byStatus = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
                
        Map<String, Long> byPriority = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority() != null ? t.getPriority().name() : "UNASSIGNED", Collectors.counting()));
                
        Map<String, Long> byCategory = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory().name() : "UNASSIGNED", Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTickets", totalTickets);
        stats.put("byStatus", byStatus);
        stats.put("byPriority", byPriority);
        stats.put("byCategory", byCategory);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportTicketsToCsv() {
        List<Ticket> allTickets = ticketRepository.findAll();
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Ticket ID,Title,Status,Priority,Category,Customer Email,Assigned Agent Email,Created At\n");
        
        // Rows
        for (Ticket t : allTickets) {
            csv.append(t.getId()).append(",")
               .append("\"").append(t.getTitle().replace("\"", "\"\"")).append("\",")
               .append(t.getStatus() != null ? t.getStatus().name() : "").append(",")
               .append(t.getPriority() != null ? t.getPriority().name() : "UNASSIGNED").append(",")
               .append(t.getCategory() != null ? t.getCategory().name() : "UNASSIGNED").append(",")
               .append(t.getCustomer() != null ? t.getCustomer().getEmail() : "").append(",")
               .append(t.getAgent() != null ? t.getAgent().getEmail() : "UNASSIGNED").append(",")
               .append(t.getCreatedAt() != null ? t.getCreatedAt().toString() : "")
               .append("\n");
        }
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tickets_export.csv");
        headers.add(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv");
        
        return new ResponseEntity<>(csv.toString(), headers, org.springframework.http.HttpStatus.OK);
    }
}
