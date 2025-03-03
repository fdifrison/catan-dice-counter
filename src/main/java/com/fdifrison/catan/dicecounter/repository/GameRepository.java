package com.fdifrison.catan.dicecounter.repository;

import com.fdifrison.catan.dicecounter.domain.Game;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {
}