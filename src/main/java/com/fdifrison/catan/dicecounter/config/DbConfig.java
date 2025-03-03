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
        dataSource.setMaximumPoolSize(2);  // Match application.yml
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(20000);
        dataSource.addDataSourceProperty("busy_timeout", "10000");  // SQLite-specific
        return dataSource;
    }
}