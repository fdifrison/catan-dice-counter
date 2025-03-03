package com.fdifrison.catan.dicecounter.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;

@Converter(autoApply = true)
public class InstantConverter implements AttributeConverter<Instant, String> {

    @Override
    public String convertToDatabaseColumn(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    @Override
    public Instant convertToEntityAttribute(String dbData) {
        return dbData != null ? Instant.parse(dbData) : null;
    }
}