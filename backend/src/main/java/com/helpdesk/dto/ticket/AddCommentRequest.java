
package com.helpdesk.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddCommentRequest {

    @NotBlank(message = "Comment message is required")
    @Size(
            max = 5000,
            message = "Comment must not exceed 5000 characters"
    )
    private String message;

    public AddCommentRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
