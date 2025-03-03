package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Roll;
import com.fdifrison.catan.dicecounter.dto.RollDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RollMapper {
    @Mapping(source = "turn.id", target = "turnId")
    RollDTO toDto(Roll roll);
}