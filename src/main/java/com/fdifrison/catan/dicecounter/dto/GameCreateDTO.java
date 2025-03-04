package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record GameCreateDTO(
        @NotBlank(message = "Game name cannot be blank") String name,
        @NotEmpty(message = "Players list cannot be empty") List<PlayerCreateDTO> players
) {}