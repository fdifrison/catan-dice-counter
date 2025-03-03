package com.fdifrison.catan.dicecounter.repository;

import com.fdifrison.catan.dicecounter.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Long> {
}