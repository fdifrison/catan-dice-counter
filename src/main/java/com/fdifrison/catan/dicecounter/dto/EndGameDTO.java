package com.fdifrison.catan.dicecounter.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record EndGameDTO(
        @NotEmpty(message = "Players list cannot be empty") List<PlayerEndDTO> players
) {
}