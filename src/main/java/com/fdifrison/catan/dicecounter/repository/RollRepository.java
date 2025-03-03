package com.fdifrison.catan.dicecounter.repository;

import com.fdifrison.catan.dicecounter.domain.Roll;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RollRepository extends JpaRepository<Roll, Long> {
}

