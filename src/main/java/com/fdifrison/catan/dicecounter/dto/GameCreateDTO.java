package com.fdifrison.catan.dicecounter.dto;

import java.util.List;

public record GameCreateDTO(
        String name,
        List<PlayerCreateDTO> players
) {
}