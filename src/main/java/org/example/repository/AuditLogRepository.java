package org.example.repository;

import org.example.model.AuditLog;
import org.example.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTicketOrderByTimestampDesc(Ticket ticket);
    
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM AuditLog a WHERE a.actor.id = :actorId")
    void deleteByActorId(@org.springframework.data.repository.query.Param("actorId") Long actorId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM AuditLog a WHERE a.ticket.id = :ticketId")
    void deleteByTicketId(@org.springframework.data.repository.query.Param("ticketId") Long ticketId);
}
