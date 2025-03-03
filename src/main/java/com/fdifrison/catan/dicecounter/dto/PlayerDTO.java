package com.fdifrison.catan.dicecounter.dto;

public record PlayerDTO(
        Long id,
        String name,
        String color,
        int order,
        Integer rank,
        Integer points
) {
}

