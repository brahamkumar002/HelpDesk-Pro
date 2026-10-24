
package com.helpdesk.dto.ticket;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String userRole;
    private String message;
    private LocalDateTime createdAt;

    public CommentResponse() {
    }

    public CommentResponse(
            Long id,
            Long ticketId,
            Long userId,
            String userName,
            String userRole,
            String message,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
