package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.Roll;
import com.fdifrison.catan.dicecounter.dto.RollDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RollMapper {
    RollDTO toDto(Roll roll);
}