package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Turn;
import com.fdifrison.catan.dicecounter.dto.TurnCreateDTO;
import com.fdifrison.catan.dicecounter.dto.TurnDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TurnMapper {
    @Mapping(source = "player.id", target = "playerId")
    TurnDTO toDto(Turn turn);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "game", ignore = true)
    @Mapping(target = "player", ignore = true) // Will be set in service
    Turn toEntity(TurnCreateDTO dto);
}