package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Player;
import com.fdifrison.catan.dicecounter.dto.PlayerCreateDTO;
import com.fdifrison.catan.dicecounter.dto.PlayerDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlayerMapper {
    @Mapping(source = "order", target = "order")
    PlayerDTO toDto(Player player);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "game", ignore = true)
    @Mapping(target = "rank", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "turns", ignore = true)
    @Mapping(source = "order", target = "order")
    Player toEntity(PlayerCreateDTO dto);
}