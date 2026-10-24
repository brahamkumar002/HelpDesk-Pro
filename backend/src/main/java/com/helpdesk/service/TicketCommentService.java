
package com.helpdesk.service;

import com.helpdesk.dto.ticket.AddCommentRequest;
import com.helpdesk.dto.ticket.CommentResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketComment;
import com.helpdesk.entity.User;
import com.helpdesk.repository.TicketCommentRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketCommentService(
            TicketCommentRepository commentRepository,
            TicketService ticketService,
            UserRepository userRepository
    ) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommentResponse addComment(
            Long ticketId,
            AddCommentRequest request,
            String email
    ) {
        User user = getCurrentUser(email);

        Ticket ticket = ticketService.getAccessibleTicket(
                ticketId,
                email
        );

        if (user.getRole() == User.Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin cannot add ticket comments"
            );
        }

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot comment on a closed ticket"
            );
        }

        String message = request.getMessage().trim();

        if (message.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment message cannot be empty"
            );
        }

        TicketComment comment = new TicketComment();

        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setMessage(message);

        TicketComment saved = commentRepository.saveAndFlush(comment);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getTicketComments(
            Long ticketId,
            String email
    ) {
        ticketService.getAccessibleTicket(ticketId, email);

        return commentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toResponse)
                .toList();
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

    private CommentResponse toResponse(TicketComment comment) {

        CommentResponse response = new CommentResponse();

        response.setId(comment.getId());
        response.setTicketId(comment.getTicket().getId());
        response.setUserId(comment.getUser().getId());
        response.setUserName(comment.getUser().getFullName());

        // FIX: Populate the comment author's role
        response.setUserRole(comment.getUser().getRole().name());

        response.setMessage(comment.getMessage());
        response.setCreatedAt(comment.getCreatedAt());

        return response;
    }
}
