
package com.helpdesk.service;

import com.helpdesk.dto.dashboard.DashboardResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.User;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardService(
            TicketRepository ticketRepository,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {

        User user = getCurrentUser(email);

        if (user.getRole() == User.Role.USER) {
            return getUserDashboard(user.getId());
        }

        if (user.getRole() == User.Role.AGENT) {
            return getAgentDashboard(user.getId());
        }

        if (user.getRole() == User.Role.ADMIN) {
            return getAdminDashboard();
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Invalid user role"
        );
    }

    private DashboardResponse getUserDashboard(Long userId) {

        return new DashboardResponse(
                ticketRepository.countByCreatedById(userId),
                countUserTickets(userId, Ticket.Status.OPEN),
                countUserTickets(userId, Ticket.Status.ASSIGNED),
                countUserTickets(userId, Ticket.Status.IN_PROGRESS),
                countUserTickets(userId, Ticket.Status.RESOLVED),
                countUserTickets(userId, Ticket.Status.CLOSED)
        );
    }

    private DashboardResponse getAgentDashboard(Long agentId) {

        return new DashboardResponse(
                ticketRepository.countByAssignedToId(agentId),
                countAgentTickets(agentId, Ticket.Status.OPEN),
                countAgentTickets(agentId, Ticket.Status.ASSIGNED),
                countAgentTickets(agentId, Ticket.Status.IN_PROGRESS),
                countAgentTickets(agentId, Ticket.Status.RESOLVED),
                countAgentTickets(agentId, Ticket.Status.CLOSED)
        );
    }

    private DashboardResponse getAdminDashboard() {

        return new DashboardResponse(
                ticketRepository.count(),
                ticketRepository.countByStatus(Ticket.Status.OPEN),
                ticketRepository.countByStatus(Ticket.Status.ASSIGNED),
                ticketRepository.countByStatus(Ticket.Status.IN_PROGRESS),
                ticketRepository.countByStatus(Ticket.Status.RESOLVED),
                ticketRepository.countByStatus(Ticket.Status.CLOSED)
        );
    }

    private long countUserTickets(
            Long userId,
            Ticket.Status status
    ) {
        return ticketRepository.countByCreatedByIdAndStatus(
                userId,
                status
        );
    }

    private long countAgentTickets(
            Long agentId,
            Ticket.Status status
    ) {
        return ticketRepository.countByAssignedToIdAndStatus(
                agentId,
                status
        );
    }

    private User getCurrentUser(String email) {

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account is disabled"
            );
        }

        return user;
    }
}
