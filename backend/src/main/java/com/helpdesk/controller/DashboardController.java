
package com.helpdesk.controller;

import com.helpdesk.dto.dashboard.DashboardResponse;
import com.helpdesk.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    // USER / AGENT / ADMIN: Get role-based dashboard statistics
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication
    ) {
        DashboardResponse response = dashboardService.getDashboard(
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }
}
