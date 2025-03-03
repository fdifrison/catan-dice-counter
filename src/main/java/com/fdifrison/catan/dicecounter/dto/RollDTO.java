package com.fdifrison.catan.dicecounter.dto;

public record RollDTO(
        Integer id,
        Integer turnId,  // New field
        int number,
        int playerIndex
) {
}