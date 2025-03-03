package com.fdifrison.catan.dicecounter.dto;

import java.time.Instant;

public record TurnDTO(
        Integer id,
        Integer playerId,
        int turnNumber,
        Instant startTimestamp,
        Instant endTimestamp
) {
}