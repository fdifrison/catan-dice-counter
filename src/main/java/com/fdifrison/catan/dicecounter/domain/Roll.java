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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    private int number;

    @Column(name = "player_index", nullable = false)
    private int playerIndex;
}