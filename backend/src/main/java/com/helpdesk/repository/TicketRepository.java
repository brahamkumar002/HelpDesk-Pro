
package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TicketRepository extends
        JpaRepository<Ticket, Long>,
        JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByCreatedById(
            Long userId,
            Pageable pageable
    );

    Page<Ticket> findByAssignedToId(
            Long agentId,
            Pageable pageable
    );

    long countByCreatedById(Long userId);

    long countByCreatedByIdAndStatus(
            Long userId,
            Ticket.Status status
    );

    long countByAssignedToId(Long agentId);

    long countByAssignedToIdAndStatus(
            Long agentId,
            Ticket.Status status
    );

    long countByStatus(Ticket.Status status);
}
