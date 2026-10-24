
package com.helpdesk.service;

import com.helpdesk.dto.ticket.*;
import com.helpdesk.entity.Category;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketHistory;
import com.helpdesk.entity.User;
import com.helpdesk.repository.TicketHistoryRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final CategoryService categoryService;
    private final AgentService agentService;

    public TicketService(
            TicketRepository ticketRepository,
            TicketHistoryRepository historyRepository,
            UserRepository userRepository,
            CategoryService categoryService,
            AgentService agentService
    ) {
        this.ticketRepository = ticketRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.categoryService = categoryService;
        this.agentService = agentService;
    }

    // USER: Create a new ticket
    @Transactional
    public TicketResponse createTicket(
            CreateTicketRequest request,
            String email
    ) {
        User user = getCurrentUser(email);
        requireRole(user, User.Role.USER);

        Category category = categoryService
                .getEnabledCategoryEntity(request.getCategoryId());

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(category);
        ticket.setCreatedBy(user);
        ticket.setPriority(request.getPriority());
        ticket.setStatus(Ticket.Status.OPEN);

        Ticket saved = ticketRepository.saveAndFlush(ticket);

        saveHistory(
                saved,
                user,
                TicketHistory.EventType.CREATED,
                "status",
                null,
                Ticket.Status.OPEN.name()
        );

        return toResponse(saved);
    }

    // USER: View own tickets
    @Transactional(readOnly = true)
    public Page<TicketResponse> getMyTickets(
            String email,
            Pageable pageable
    ) {
        User user = getCurrentUser(email);
        requireRole(user, User.Role.USER);

        return ticketRepository
                .findByCreatedById(user.getId(), pageable)
                .map(this::toResponse);
    }

    // AGENT: View assigned tickets
    @Transactional(readOnly = true)
    public Page<TicketResponse> getAssignedTickets(
            String email,
            Pageable pageable
    ) {
        User agent = getCurrentUser(email);
        requireRole(agent, User.Role.AGENT);

        return ticketRepository
                .findByAssignedToId(agent.getId(), pageable)
                .map(this::toResponse);
    }

    // ADMIN: View all tickets with optional filters
    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(
            Ticket.Status status,
            Ticket.Priority priority,
            Long categoryId,
            Pageable pageable,
            String email
    ) {
        User admin = getCurrentUser(email);
        requireRole(admin, User.Role.ADMIN);

        Specification<Ticket> specification =
                (root, query, builder) ->
                        builder.conjunction();

        if (status != null) {
            specification = specification.and(
                    (root, query, builder) ->
                            builder.equal(
                                    root.get("status"),
                                    status
                            )
            );
        }

        if (priority != null) {
            specification = specification.and(
                    (root, query, builder) ->
                            builder.equal(
                                    root.get("priority"),
                                    priority
                            )
            );
        }

        if (categoryId != null) {
            specification = specification.and(
                    (root, query, builder) ->
                            builder.equal(
                                    root.get("category").get("id"),
                                    categoryId
                            )
            );
        }

        return ticketRepository
                .findAll(specification, pageable)
                .map(this::toResponse);
    }

    // USER / AGENT / ADMIN: View ticket with access control
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(
            Long ticketId,
            String email
    ) {
        User user = getCurrentUser(email);
        Ticket ticket = findTicket(ticketId);

        checkTicketAccess(ticket, user);

        return toResponse(ticket);
    }

    // ADMIN: Assign or reassign ticket
    @Transactional
    public TicketResponse assignTicket(
            Long ticketId,
            AssignTicketRequest request,
            String email
    ) {
        User admin = getCurrentUser(email);
        requireRole(admin, User.Role.ADMIN);

        Ticket ticket = findTicket(ticketId);

        if (ticket.getStatus() != Ticket.Status.OPEN
                && ticket.getStatus() != Ticket.Status.ASSIGNED
                && ticket.getStatus() != Ticket.Status.IN_PROGRESS) {
            throw badRequest(
                    "Ticket cannot be assigned in its current status"
            );
        }

        User agent = agentService
                .getEnabledAgentEntity(request.getAgentId());

        User previousAgent = ticket.getAssignedTo();

        if (previousAgent != null
                && Objects.equals(
                previousAgent.getId(),
                agent.getId()
        )) {
            throw badRequest(
                    "Ticket is already assigned to this agent"
            );
        }

        Ticket.Status oldStatus = ticket.getStatus();

        ticket.setAssignedTo(agent);
        ticket.setStatus(Ticket.Status.ASSIGNED);

        ticketRepository.save(ticket);

        saveHistory(
                ticket,
                admin,
                previousAgent == null
                        ? TicketHistory.EventType.ASSIGNED
                        : TicketHistory.EventType.REASSIGNED,
                "assigned_to",
                previousAgent == null
                        ? null
                        : previousAgent.getId().toString(),
                agent.getId().toString()
        );

        if (oldStatus != Ticket.Status.ASSIGNED) {
            saveStatusHistory(
                    ticket,
                    admin,
                    oldStatus,
                    Ticket.Status.ASSIGNED
            );
        }

        return toResponse(ticket);
    }

    // AGENT: Start working on assigned ticket
    @Transactional
    public TicketResponse startTicket(
            Long ticketId,
            String email
    ) {
        User agent = getCurrentUser(email);
        requireRole(agent, User.Role.AGENT);

        Ticket ticket = findTicket(ticketId);
        requireAssignedAgent(ticket, agent);

        if (ticket.getStatus() != Ticket.Status.ASSIGNED) {
            throw badRequest(
                    "Only ASSIGNED tickets can be started"
            );
        }

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(Ticket.Status.IN_PROGRESS);

        ticketRepository.save(ticket);

        saveStatusHistory(
                ticket,
                agent,
                oldStatus,
                Ticket.Status.IN_PROGRESS
        );

        return toResponse(ticket);
    }

    // AGENT: Resolve ticket
    @Transactional
    public TicketResponse resolveTicket(
            Long ticketId,
            ResolveTicketRequest request,
            String email
    ) {
        User agent = getCurrentUser(email);
        requireRole(agent, User.Role.AGENT);

        Ticket ticket = findTicket(ticketId);
        requireAssignedAgent(ticket, agent);

        if (ticket.getStatus() != Ticket.Status.IN_PROGRESS) {
            throw badRequest(
                    "Only IN_PROGRESS tickets can be resolved"
            );
        }

        String notes = request.getResolutionNotes().trim();

        if (notes.isEmpty() || notes.length() > 5000) {
            throw badRequest(
                    "Resolution notes must contain 1 to 5000 characters"
            );
        }

        ticket.setResolutionNotes(notes);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setStatus(Ticket.Status.RESOLVED);

        ticketRepository.save(ticket);

        saveStatusHistory(
                ticket,
                agent,
                Ticket.Status.IN_PROGRESS,
                Ticket.Status.RESOLVED
        );

        return toResponse(ticket);
    }

    // USER: Close resolved ticket
    @Transactional
    public TicketResponse closeTicket(
            Long ticketId,
            String email
    ) {
        User user = getCurrentUser(email);
        requireRole(user, User.Role.USER);

        Ticket ticket = findTicket(ticketId);
        requireCreator(ticket, user);

        if (ticket.getStatus() != Ticket.Status.RESOLVED) {
            throw badRequest(
                    "Only RESOLVED tickets can be closed"
            );
        }

        ticket.setStatus(Ticket.Status.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());

        ticketRepository.save(ticket);

        saveStatusHistory(
                ticket,
                user,
                Ticket.Status.RESOLVED,
                Ticket.Status.CLOSED
        );

        return toResponse(ticket);
    }

    // USER: Reopen resolved ticket
    @Transactional
    public TicketResponse reopenTicket(
            Long ticketId,
            String email
    ) {
        User user = getCurrentUser(email);
        requireRole(user, User.Role.USER);

        Ticket ticket = findTicket(ticketId);
        requireCreator(ticket, user);

        if (ticket.getStatus() != Ticket.Status.RESOLVED) {
            throw badRequest(
                    "Only RESOLVED tickets can be reopened"
            );
        }

        ticket.setStatus(Ticket.Status.IN_PROGRESS);
        ticket.setResolutionNotes(null);
        ticket.setResolvedAt(null);

        ticketRepository.save(ticket);

        saveStatusHistory(
                ticket,
                user,
                Ticket.Status.RESOLVED,
                Ticket.Status.IN_PROGRESS
        );

        return toResponse(ticket);
    }

    // ADMIN: Change ticket priority
    @Transactional
    public TicketResponse changePriority(
            Long ticketId,
            ChangePriorityRequest request,
            String email
    ) {
        User admin = getCurrentUser(email);
        requireRole(admin, User.Role.ADMIN);

        Ticket ticket = findTicket(ticketId);

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw badRequest(
                    "Cannot change priority of a closed ticket"
            );
        }

        Ticket.Priority oldPriority = ticket.getPriority();
        Ticket.Priority newPriority = request.getPriority();

        if (newPriority == null) {
            throw badRequest("Priority is required");
        }

        if (oldPriority == newPriority) {
            throw badRequest(
                    "Ticket already has this priority"
            );
        }

        ticket.setPriority(newPriority);
        ticketRepository.save(ticket);

        saveHistory(
                ticket,
                admin,
                TicketHistory.EventType.PRIORITY_CHANGED,
                "priority",
                oldPriority.name(),
                newPriority.name()
        );

        return toResponse(ticket);
    }

    // ADMIN: View audit history
    @Transactional(readOnly = true)
    public List<TicketHistoryResponse> getTicketHistory(
            Long ticketId,
            String email
    ) {
        User admin = getCurrentUser(email);
        requireRole(admin, User.Role.ADMIN);

        findTicket(ticketId);

        return historyRepository
                .findByTicketIdOrderByChangedAtAsc(ticketId)
                .stream()
                .map(history -> new TicketHistoryResponse(
                        history.getId(),
                        history.getTicket().getId(),
                        history.getChangedBy().getId(),
                        history.getChangedBy().getFullName(),
                        history.getEventType().name(),
                        history.getFieldName(),
                        history.getOldValue(),
                        history.getNewValue(),
                        history.getChangedAt()
                ))
                .toList();
    }

    // Shared access check for future comment service
    @Transactional(readOnly = true)
    public Ticket getAccessibleTicket(
            Long ticketId,
            String email
    ) {
        User user = getCurrentUser(email);
        Ticket ticket = findTicket(ticketId);

        checkTicketAccess(ticket, user);

        return ticket;
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

        User user = userRepository
                .findByEmail(normalizedEmail)
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

    private Ticket findTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));
    }

    private void requireRole(
            User user,
            User.Role role
    ) {
        if (user.getRole() != role) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied"
            );
        }
    }

    private void requireCreator(
            Ticket ticket,
            User user
    ) {
        if (!Objects.equals(
                ticket.getCreatedBy().getId(),
                user.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only manage your own tickets"
            );
        }
    }

    private void requireAssignedAgent(
            Ticket ticket,
            User agent
    ) {
        if (ticket.getAssignedTo() == null
                || !Objects.equals(
                ticket.getAssignedTo().getId(),
                agent.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Ticket is not assigned to you"
            );
        }
    }

    private void checkTicketAccess(
            Ticket ticket,
            User user
    ) {
        if (user.getRole() == User.Role.ADMIN) {
            return;
        }

        if (user.getRole() == User.Role.USER) {
            requireCreator(ticket, user);
            return;
        }

        if (user.getRole() == User.Role.AGENT) {
            requireAssignedAgent(ticket, user);
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Access denied"
        );
    }

    private void saveStatusHistory(
            Ticket ticket,
            User changedBy,
            Ticket.Status oldStatus,
            Ticket.Status newStatus
    ) {
        saveHistory(
                ticket,
                changedBy,
                TicketHistory.EventType.STATUS_CHANGED,
                "status",
                oldStatus.name(),
                newStatus.name()
        );
    }

    private void saveHistory(
            Ticket ticket,
            User changedBy,
            TicketHistory.EventType eventType,
            String fieldName,
            String oldValue,
            String newValue
    ) {
        TicketHistory history = new TicketHistory();

        history.setTicket(ticket);
        history.setChangedBy(changedBy);
        history.setEventType(eventType);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);

        historyRepository.save(history);
    }

    private ResponseStatusException badRequest(
            String message
    ) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    private TicketResponse toResponse(Ticket ticket) {

        TicketResponse response = new TicketResponse();

        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());

        response.setCategoryId(
                ticket.getCategory().getId()
        );
        response.setCategoryName(
                ticket.getCategory().getName()
        );

        response.setCreatedById(
                ticket.getCreatedBy().getId()
        );
        response.setCreatedByName(
                ticket.getCreatedBy().getFullName()
        );

        if (ticket.getAssignedTo() != null) {
            response.setAssignedToId(
                    ticket.getAssignedTo().getId()
            );
            response.setAssignedToName(
                    ticket.getAssignedTo().getFullName()
            );
        }

        response.setPriority(
                ticket.getPriority().name()
        );
        response.setStatus(
                ticket.getStatus().name()
        );

        response.setResolutionNotes(
                ticket.getResolutionNotes()
        );

        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setClosedAt(ticket.getClosedAt());

        return response;
    }
}
