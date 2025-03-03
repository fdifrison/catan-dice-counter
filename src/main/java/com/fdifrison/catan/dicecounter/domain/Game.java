package com.fdifrison.catan.dicecounter.domain;

import com.fdifrison.catan.dicecounter.converter.InstantConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "game")
@Getter
@Setter
public class Game {
    @Id
    private Integer id;  // Remove @GeneratedValue

    @Column(nullable = false)
    private String name;

    @Column(name = "start_timestamp", nullable = false)
    @Convert(converter = InstantConverter.class)
    private Instant startTimestamp;

    @Column(name = "end_timestamp")
    @Convert(converter = InstantConverter.class)
    private Instant endTimestamp;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Player> players;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Roll> rolls;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Turn> turns;
}