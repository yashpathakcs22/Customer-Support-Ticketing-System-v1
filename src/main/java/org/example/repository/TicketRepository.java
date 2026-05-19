package org.example.repository;

import org.example.model.Ticket;
import org.example.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomer(User customer);
    List<Ticket> findByAgent(User agent);

    org.springframework.data.domain.Page<Ticket> findByAgent(User agent, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Ticket> findByAgentAndStatusIn(User agent, List<org.example.model.TicketStatus> statuses, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Ticket t WHERE t.customer = :user AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Ticket> searchByCustomer(@org.springframework.data.repository.query.Param("user") User user, @org.springframework.data.repository.query.Param("query") String query);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Ticket t WHERE t.agent = :user AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Ticket> searchByAgent(@org.springframework.data.repository.query.Param("user") User user, @org.springframework.data.repository.query.Param("query") String query);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Ticket t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Ticket> searchAll(@org.springframework.data.repository.query.Param("query") String query);
}
