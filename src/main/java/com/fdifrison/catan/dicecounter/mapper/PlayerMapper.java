package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Player;
import com.fdifrison.catan.dicecounter.dto.PlayerCreateDTO;
import com.fdifrison.catan.dicecounter.dto.PlayerDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {GlobalPlayerMapper.class})
public interface PlayerMapper {
    @Mapping(source = "globalPlayer.id", target = "globalPlayerId")
    @Mapping(source = "globalPlayer.name", target = "name")
    @Mapping(source = "globalPlayer.email", target = "email")
    @Mapping(source = "order", target = "order")
    PlayerDTO toDto(Player player);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "game", ignore = true)
    @Mapping(target = "globalPlayer", ignore = true) // Set in service
    @Mapping(target = "rank", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "turns", ignore = true)
    @Mapping(source = "order", target = "order")
    @Mapping(source = "color", target = "color")
    Player toEntity(PlayerCreateDTO dto);
}