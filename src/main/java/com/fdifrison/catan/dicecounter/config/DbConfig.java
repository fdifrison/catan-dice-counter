package com.fdifrison.catan.dicecounter.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DbConfig {

    private final DbProperties properties;

    public DbConfig(DbProperties properties) {
        this.properties = properties;
    }

    @Bean
    public HikariDataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(properties.url());
        dataSource.setDriverClassName(properties.driverClassName());
        dataSource.setMaximumPoolSize(properties.hikari().maximumPoolSize());  // Match application.yml
        dataSource.setMinimumIdle(properties.hikari().minimumIdle());
        dataSource.setConnectionTimeout(properties.hikari().connectionTimeout());
        dataSource.setIdleTimeout(properties.hikari().idleTimeout());
        dataSource.setMaxLifetime(properties.hikari().maxLifetime());
        dataSource.addDataSourceProperty("busy_timeout", "10000");  // SQLite-specific
        return dataSource;
    }
}