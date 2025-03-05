package com.fdifrison.catan.dicecounter.dto;

import java.util.Map;

public record PlayerStatsDTO(
        Integer totalPoints,
        Double averagePoints,
        Integer luckyNumber,
        Map<Integer, Integer> rollDistribution, // Key: roll number (2-12), Value: count
        Double longestTurnSeconds,
        Double shortestTurnSeconds,
        Double averageTurnSeconds
) {}