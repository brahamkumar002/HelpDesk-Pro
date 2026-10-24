
package com.helpdesk.dto.ticket;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AssignTicketRequest {

    @NotNull(message = "Agent ID is required")
    @Positive(message = "Agent ID must be positive")
    private Long agentId;

    public AssignTicketRequest() {
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
}
