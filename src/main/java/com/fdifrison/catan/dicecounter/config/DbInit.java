package com.fdifrison.catan.dicecounter.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class DbInit {
    private static final String DB_PATH = "/app/data/database.db";

    @PostConstruct
    public void initializeDatabaseFile() {
        File dbFile = new File(DB_PATH);
        File parentDir = dbFile.getParentFile();

        try {
            // Ensure parent directory exists
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }

            // Create the SQLite file if it doesn't exist
            if (!dbFile.exists()) {
                if (dbFile.createNewFile()) {
                    System.out.println("SQLite database file created at: " + DB_PATH);
                } else {
                    System.err.println("Failed to create SQLite database file.");
                }
            }
        } catch (IOException e) {
            System.err.println("Error creating SQLite database file: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
