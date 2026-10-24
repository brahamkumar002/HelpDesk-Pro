
package com.helpdesk.dto.ticket;

import java.time.LocalDateTime;

public class TicketHistoryResponse {

    private Long id;
    private Long ticketId;

    private Long changedById;
    private String changedByName;

    private String eventType;
    private String fieldName;
    private String oldValue;
    private String newValue;

    private LocalDateTime changedAt;

    public TicketHistoryResponse() {
    }

    public TicketHistoryResponse(
            Long id,
            Long ticketId,
            Long changedById,
            String changedByName,
            String eventType,
            String fieldName,
            String oldValue,
            String newValue,
            LocalDateTime changedAt
    ) {
        this.id = id;
        this.ticketId = ticketId;
        this.changedById = changedById;
        this.changedByName = changedByName;
        this.eventType = eventType;
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changedAt = changedAt;
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

    public Long getChangedById() {
        return changedById;
    }

    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
