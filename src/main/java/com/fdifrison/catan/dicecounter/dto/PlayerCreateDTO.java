package com.fdifrison.catan.dicecounter.dto;

public record PlayerCreateDTO(
        String name,
        String color,
        int order
) {
}