package com.team1.backend.subscription.repository;

import com.team1.backend.subscription.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {
}
