package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.dto.AdminDashboardResponse;
import com.iamzakaria.auctionplatform.auction.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(
            AdminDashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}