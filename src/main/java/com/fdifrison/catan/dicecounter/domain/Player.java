package com.fdifrison.catan.dicecounter.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "player")
@Getter
@Setter
public class Player {
    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "global_player_id", nullable = false)
    private GlobalPlayer globalPlayer;

    @Column(name = "order_number", nullable = false)
    private int order;

    @Column(nullable = false)
    private String color;

    private Integer rank;

    private Integer points;

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Turn> turns;
}