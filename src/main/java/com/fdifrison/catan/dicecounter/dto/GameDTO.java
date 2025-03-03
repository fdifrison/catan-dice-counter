package com.fdifrison.catan.dicecounter.dto;

import lombok.With;

import java.time.Instant;
import java.util.List;

public record GameDTO(
        Integer id,
        String name,
        Instant startTimestamp,
        Instant endTimestamp,
        @With List<PlayerDTO> players,
        @With List<RollDTO> rolls,
        @With List<TurnDTO> turns
) {
}