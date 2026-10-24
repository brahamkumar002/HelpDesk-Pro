
package com.helpdesk.controller;

import com.helpdesk.dto.ticket.AssignTicketRequest;
import com.helpdesk.dto.ticket.ChangePriorityRequest;
import com.helpdesk.dto.ticket.CreateTicketRequest;
import com.helpdesk.dto.ticket.ResolveTicketRequest;
import com.helpdesk.dto.ticket.TicketHistoryResponse;
import com.helpdesk.dto.ticket.TicketResponse;
import com.helpdesk.entity.Ticket;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // USER: Create a ticket
    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication
    ) {
        TicketResponse response = ticketService.createTicket(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // USER: View own tickets
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(
            Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.getMyTickets(
                        authentication.getName(),
                        pageable
                )
        );
    }

    // AGENT: View assigned tickets
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/assigned")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(
            Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.getAssignedTickets(
                        authentication.getName(),
                        pageable
                )
        );
    }

    // ADMIN: View all tickets with optional filters
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(required = false) Ticket.Status status,
            @RequestParam(required = false) Ticket.Priority priority,
            @RequestParam(required = false) Long categoryId,
            Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.getAllTickets(
                        status,
                        priority,
                        categoryId,
                        pageable,
                        authentication.getName()
                )
        );
    }

    // USER / AGENT / ADMIN: View ticket details
    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.getTicketById(
                        ticketId,
                        authentication.getName()
                )
        );
    }

    // ADMIN: Assign or reassign a ticket
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.assignTicket(
                        ticketId,
                        request,
                        authentication.getName()
                )
        );
    }

    // AGENT: Start working on a ticket
    @PreAuthorize("hasRole('AGENT')")
    @PatchMapping("/{ticketId}/start")
    public ResponseEntity<TicketResponse> startTicket(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.startTicket(
                        ticketId,
                        authentication.getName()
                )
        );
    }

    // AGENT: Resolve a ticket
    @PreAuthorize("hasRole('AGENT')")
    @PatchMapping("/{ticketId}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody ResolveTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.resolveTicket(
                        ticketId,
                        request,
                        authentication.getName()
                )
        );
    }

    // USER: Close a resolved ticket
    @PreAuthorize("hasRole('USER')")
    @PatchMapping("/{ticketId}/close")
    public ResponseEntity<TicketResponse> closeTicket(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.closeTicket(
                        ticketId,
                        authentication.getName()
                )
        );
    }

    // USER: Reopen a resolved ticket
    @PreAuthorize("hasRole('USER')")
    @PatchMapping("/{ticketId}/reopen")
    public ResponseEntity<TicketResponse> reopenTicket(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.reopenTicket(
                        ticketId,
                        authentication.getName()
                )
        );
    }

    // ADMIN: Change ticket priority
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{ticketId}/priority")
    public ResponseEntity<TicketResponse> changePriority(
            @PathVariable Long ticketId,
            @Valid @RequestBody ChangePriorityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.changePriority(
                        ticketId,
                        request,
                        authentication.getName()
                )
        );
    }

    // ADMIN: View ticket audit history
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{ticketId}/history")
    public ResponseEntity<List<TicketHistoryResponse>> getTicketHistory(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.getTicketHistory(
                        ticketId,
                        authentication.getName()
                )
        );
    }
}
