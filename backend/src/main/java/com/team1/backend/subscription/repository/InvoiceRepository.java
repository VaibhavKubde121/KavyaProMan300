package com.team1.backend.subscription.repository;

import com.team1.backend.subscription.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}
