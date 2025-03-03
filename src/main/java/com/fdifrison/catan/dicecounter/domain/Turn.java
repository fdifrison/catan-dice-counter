package com.fdifrison.catan.dicecounter.domain;

import com.fdifrison.catan.dicecounter.converter.InstantConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "turn")
@Getter
@Setter
public class Turn {
    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "turn_number", nullable = false)
    private int turnNumber;

    @Column(name = "start_timestamp", nullable = false)
    @Convert(converter = InstantConverter.class)
    private Instant startTimestamp;

    @Column(name = "end_timestamp", nullable = false)
    @Convert(converter = InstantConverter.class)
    private Instant endTimestamp;
}