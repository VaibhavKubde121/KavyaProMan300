package com.team1.backend.subscription.dto;

import lombok.Data;

@Data
public class PlanDto {
    private Long id;
    private String name;
    private String description;
    private double monthlyPrice;
    private double yearlyPrice;
    private boolean featured;
}
