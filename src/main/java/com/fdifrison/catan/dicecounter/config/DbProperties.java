package com.fdifrison.catan.dicecounter.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spring.datasource")
public record DbProperties(String url, String driverClassName, Hikari hikari) {

    record Hikari(long connectionTimeout,
                  int maximumPoolSize ,
                  int minimumIdle,
                  long idleTimeout,
                  long maxLifetime,
                  long busyTimeout) {}
}