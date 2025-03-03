package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotNull;

public record PlayerEndDTO(
        Integer id,
        @NotNull(message = "Rank cannot be null") Integer rank,
        Integer points
) {
}