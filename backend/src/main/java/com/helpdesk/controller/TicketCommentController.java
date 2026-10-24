
package com.helpdesk.controller;

import com.helpdesk.dto.ticket.AddCommentRequest;
import com.helpdesk.dto.ticket.CommentResponse;
import com.helpdesk.service.TicketCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(
            TicketCommentService commentService
    ) {
        this.commentService = commentService;
    }

    // USER / AGENT: Add a comment to an accessible ticket
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddCommentRequest request,
            Authentication authentication
    ) {
        CommentResponse response = commentService.addComment(
                ticketId,
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // USER / AGENT / ADMIN: View ticket comments
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getTicketComments(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                commentService.getTicketComments(
                        ticketId,
                        authentication.getName()
                )
        );
    }
}
