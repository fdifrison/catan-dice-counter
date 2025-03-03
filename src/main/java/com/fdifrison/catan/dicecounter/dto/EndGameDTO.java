package com.fdifrison.catan.dicecounter.dto;

import java.util.List;

public record EndGameDTO(
        List<PlayerEndDTO> players
) {
}