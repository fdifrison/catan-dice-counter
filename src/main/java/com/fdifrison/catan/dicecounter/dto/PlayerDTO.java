package com.fdifrison.catan.dicecounter.dto;

public record PlayerDTO(
        Integer id,
        Integer globalPlayerId,
        String name,
        String email,
        String color,
        int order,
        Integer rank,
        Integer points
) {}