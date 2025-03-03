package com.fdifrison.catan.dicecounter.repository;

import com.fdifrison.catan.dicecounter.domain.Turn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TurnRepository extends JpaRepository<Turn, Integer> {
    @Query("SELECT t FROM Turn t WHERE t.game.id = :gameId")
    List<Turn> findByGameId(Integer gameId);
}