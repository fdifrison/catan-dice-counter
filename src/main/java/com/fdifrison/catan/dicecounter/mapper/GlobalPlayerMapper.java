package com.fdifrison.catan.dicecounter.mapper;

import com.fdifrison.catan.dicecounter.domain.GlobalPlayer;
import com.fdifrison.catan.dicecounter.dto.GlobalPlayerDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GlobalPlayerMapper {
    GlobalPlayerDTO toDto(GlobalPlayer globalPlayer);
    GlobalPlayer toEntity(GlobalPlayerDTO dto);
}