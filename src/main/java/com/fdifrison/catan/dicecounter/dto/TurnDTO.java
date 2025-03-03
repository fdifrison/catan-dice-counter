package com.fdifrison.catan.dicecounter.dto;

import java.time.Instant;

public record TurnDTO(
        Long id,
        Long playerId,
        int turnNumber,
        Instant startTimestamp,
        Instant endTimestamp
) {
}