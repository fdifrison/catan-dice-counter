package com.fdifrison.catan.dicecounter.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "global_player")
@Getter
@Setter
public class GlobalPlayer {
    @Id
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;
}