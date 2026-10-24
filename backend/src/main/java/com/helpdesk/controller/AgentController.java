
package com.helpdesk.controller;

import com.helpdesk.dto.admin.AgentResponse;
import com.helpdesk.dto.admin.CreateAgentRequest;
import com.helpdesk.service.AgentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/agents")
@PreAuthorize("hasRole('ADMIN')")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    // ADMIN: Create a new support agent
    @PostMapping
    public ResponseEntity<AgentResponse> createAgent(
            @Valid @RequestBody CreateAgentRequest request
    ) {
        AgentResponse response = agentService.createAgent(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ADMIN: View all agents
    @GetMapping
    public ResponseEntity<List<AgentResponse>> getAllAgents() {

        return ResponseEntity.ok(
                agentService.getAllAgents()
        );
    }

    // ADMIN: View enabled agents
    @GetMapping("/enabled")
    public ResponseEntity<List<AgentResponse>> getEnabledAgents() {

        return ResponseEntity.ok(
                agentService.getEnabledAgents()
        );
    }

    // ADMIN: View a specific agent
    @GetMapping("/{agentId}")
    public ResponseEntity<AgentResponse> getAgentById(
            @PathVariable Long agentId
    ) {
        return ResponseEntity.ok(
                agentService.getAgentById(agentId)
        );
    }

    // ADMIN: Disable an agent
    @PatchMapping("/{agentId}/disable")
    public ResponseEntity<AgentResponse> disableAgent(
            @PathVariable Long agentId
    ) {
        return ResponseEntity.ok(
                agentService.disableAgent(agentId)
        );
    }

    // ADMIN: Enable an agent
    @PatchMapping("/{agentId}/enable")
    public ResponseEntity<AgentResponse> enableAgent(
            @PathVariable Long agentId
    ) {
        return ResponseEntity.ok(
                agentService.enableAgent(agentId)
        );
    }
}
