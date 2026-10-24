
package com.helpdesk.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResolveTicketRequest {

    @NotBlank(message = "Resolution notes are required")
    @Size(
            max = 5000,
            message = "Resolution notes must not exceed 5000 characters"
    )
    private String resolutionNotes;

    public ResolveTicketRequest() {
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
