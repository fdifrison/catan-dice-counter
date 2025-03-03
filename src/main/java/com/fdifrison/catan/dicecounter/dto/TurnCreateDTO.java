package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record TurnCreateDTO(
        Integer playerId,
        int turnNumber,
        Instant startTimestamp,
        Instant endTimestamp,
        @NotNull(message = "Roll number cannot be null") Integer rollNumber
) {
}