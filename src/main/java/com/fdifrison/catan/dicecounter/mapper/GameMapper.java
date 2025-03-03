package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Game;
import com.fdifrison.catan.dicecounter.dto.GameCreateDTO;
import com.fdifrison.catan.dicecounter.dto.GameDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;

@Mapper(componentModel = "spring", uses = {PlayerMapper.class, RollMapper.class, TurnMapper.class})
public interface GameMapper {
    @Mapping(source = "players", target = "players")
    @Mapping(source = "rolls", target = "rolls")
    @Mapping(source = "turns", target = "turns")
    GameDTO toDto(Game game);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "startTimestamp", expression = "java(Instant.now())")
    @Mapping(target = "endTimestamp", ignore = true)
    @Mapping(target = "rolls", ignore = true)
    @Mapping(target = "turns", ignore = true)
    Game toEntity(GameCreateDTO dto);
}