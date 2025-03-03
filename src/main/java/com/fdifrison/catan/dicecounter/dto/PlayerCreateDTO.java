package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotBlank;

public record PlayerCreateDTO(
        @NotBlank(message = "Player name cannot be blank") String name,
        String color,
        int order
) {
}