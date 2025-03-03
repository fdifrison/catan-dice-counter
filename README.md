# Catan Dice Counter

## Project Overview
The **Catan Dice Counter** is a web application designed to enhance *Settlers of Catan* gameplay by tracking dice rolls and providing statistical insights. It allows players to record rolls (2-12), visualize distributions via histograms (total and per-player by color), and analyze game stats (e.g., start/end times, turn durations, winner). Features include creating games with player names/colors, undoing rolls, and reviewing historical games. Built as a full-stack app with a Spring Boot backend, Angular frontend, and SQLite database, it’s deployable as a single JAR on Railway.

### Goals
- Track dice rolls per player with timestamps.
- Display real-time histograms with player-specific colors.
- Store game history (start/end times, winner, turn times).
- Enable roll undo functionality.
- Offer a menu for new games or viewing past games.
- Deploy affordably on Railway’s Starter plan ($5/month).

## Technical Stack
- **Backend**: Spring Boot 3.3.0, Java 23
    - **Why**: Spring Boot provides robust REST APIs and JPA integration. Java 23 ensures modern features (e.g., virtual threads).
- **Frontend**: Angular 19 (standalone components)
    - **Why**: Latest version (February 2025) for a modern SPA, with routing and dynamic UI capabilities.
- **Database**: SQLite (`sqlite-jdbc:3.49.1.0`)
    - **Why**: Lightweight, file-based, fits Railway’s persistence model with minimal overhead.
- **Deployment**: Railway Starter Plan
    - **Why**: Cost-effective (~$0.90-1.34/month), supports single JAR with persistent volumes.
- **Build**: Maven
    - **Why**: Integrates backend and frontend builds into one deployable artifact.

## Architecture
- **Monorepo**: Single Git repo (`dice-counter/`) with:
    - Backend: `src/main/java/`.
    - Frontend: `frontend/`.
    - **Why**: Simplifies development and deployment.
- **Backend Structure**:
    - `com.catan.dicecounter.controller`: `HomeController` for SPA routing.
    - `com.catan.dicecounter.model`: JPA entities (pending: `Game`, `Player`, `Roll`).
    - `com.catan.dicecounter.repository`: JPA repositories (TBD).
    - `com.catan.dicecounter.service`: Business logic (TBD).
- **Frontend Structure**: Angular 19 in `frontend/`, built to `dist/dice-counter/browser/`, copied to `static/browser/`.
- **Database**: SQLite at `/data/database.db` (Railway) or `./data/database.db` (local, temporary).
- **Routing**: Angular uses `app.routes.ts` (standalone); Spring Boot forwards `/` to `/browser/index.html`.

## Frontend Overview

The frontend is a single-page application (SPA) using Angular 19 standalone components, styled with a custom theme (gold text, red gradients, Cinzel font). It includes the following components:

### Components
- **MainMenuComponent**: Entry point with options to start a new game or view history.
- **GameSetupComponent**: Configure game name, player count (2-5), and player details (name, unique color).
- **GameplayComponent**: Track dice rolls with a stacked bar chart, timer, and turn management.
- **EndGameComponent**: Assign ranks (exclusive dropdown) and points, display winner with confetti.
- **HistoryComponent**: List past games with names and dates, delete option with confirmation modal.
- **GameHistoryDetailComponent**: Detailed view of past games with two charts:
    - "Rolls Distribution": Stacked bar chart of roll frequency by player.
    - "Roll Sequence": Horizontal bar chart showing dice numbers per turn.

### Features
- **Responsive Design**: Optimized for portrait (e.g., 414x666px), with minimal scroll.
- **Local Storage**: Persists game data (`gameSetup`, `gameplayData`, `gameHistory`).
- **Charts**: Uses Chart.js for roll distribution (bar) and sequence (horizontal bar) visualizations.
- **Exclusivity**: Unique player colors in setup, exclusive ranks in end-game.

## Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd frontend
   npm install
   ng serve --host 0.0.0.0 --port 4200
   ```   
* Access at http://<your-ip>:4200/.