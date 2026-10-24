
package com.helpdesk.dto.ticket;

import com.helpdesk.entity.Ticket;
import jakarta.validation.constraints.NotNull;

public class ChangePriorityRequest {

    @NotNull(message = "Priority is required")
    private Ticket.Priority priority;

    public ChangePriorityRequest() {
    }

    public Ticket.Priority getPriority() {
        return priority;
    }

    public void setPriority(Ticket.Priority priority) {
        this.priority = priority;
    }
}
