package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PlayerCreateDTO(
        @NotNull(message = "Global player ID cannot be null") Integer globalPlayerId,
        @NotBlank(message = "Color cannot be blank") String color,
        int order
) {}