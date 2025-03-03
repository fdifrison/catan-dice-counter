package com.fdifrison.catan.dicecounter.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roll")
@Getter
@Setter
public class Roll {
    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turn_id")  // New field
    private Turn turn;

    @Column(nullable = false)
    private int number;

    @Column(name = "player_index", nullable = false)
    private int playerIndex;
}