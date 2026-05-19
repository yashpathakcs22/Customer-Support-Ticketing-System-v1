package org.example.repository;

import org.example.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = 'AGENT' AND u.active = true ORDER BY (SELECT COUNT(t) FROM Ticket t WHERE t.agent = u AND t.status IN ('OPEN', 'IN_PROGRESS')) ASC")
    Page<User> findAgentWithLeastWorkload(Pageable pageable);
}
