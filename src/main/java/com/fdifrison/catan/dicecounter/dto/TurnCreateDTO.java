package com.fdifrison.catan.dicecounter.dto;

import java.time.Instant;

public record TurnCreateDTO(
        Long playerId,
        int turnNumber,
        Instant startTimestamp,
        Instant endTimestamp,
        Integer rollNumber  // Optional, null if no roll occurred this turn
) {
}