package com.fdifrison.catan.dicecounter.repository;

import com.fdifrison.catan.dicecounter.domain.GlobalPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GlobalPlayerRepository extends JpaRepository<GlobalPlayer, Integer> {
}