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

## Key Decisions
1. **Spring Boot + Angular Integration**:
    - Angular build (`ng build --output-path=dist/dice-counter --base-href=/browser/`) outputs to `dist/dice-counter/browser/`.
    - Maven’s `frontend-maven-plugin` builds Angular, `maven-resources-plugin` copies to `static/browser/`.
    - `HomeController` forwards `["", "/", "/{path:[^\\.]*}"]` to `/browser/index.html`.
    - **Why**: Single JAR deployment, leverages Spring’s static serving with SPA routing.
2. **SQLite Configuration**:
    - Uses `sqlite-jdbc:3.49.1.0` and `hibernate-community-dialects:7.0.0.Beta1`.
    - `application.yml`: `jdbc:sqlite:./data/database.db` (local) vs. `/data/database.db` (Railway).
    - **Why**: Lightweight DB; local workaround until profiles implemented.
3. **Frontend Styling**:
    - Bootstrap 5 for layout, custom CSS for Catan theme (parchment background, brown buttons).
    - `MainMenuComponent` with logo and animated buttons.
    - **Why**: Quick, polished UI with Catan flair.

## Current State
- **Backend**: Spring Boot serves Angular frontend at `http://localhost:8080/` and `/browser/index.html`. No entities/APIs yet.
- **Frontend**: Angular 19 standalone setup:
    - `MainMenuComponent`: Styled with title, Catan logo (hover effects), and buttons (“New Game”, “Game History”).
    - Routing via `app.routes.ts` maps `/` to `MainMenuComponent`.
- **Database**: SQLite configured but empty (tables pending).
- **Build**: `mvn package` compiles backend and frontend into JAR.
- **Deployment**: Ready for Railway with volume at `/data/` (not deployed yet).

### Latest Developments
- **Angular Build Fix**: Updated `frontend/package.json` to `ng build --output-path=dist/dice-counter --base-href=/browser/`, ensuring `<base href="/browser/">` aligns with `static/browser/` script paths. No `runtime.js` (Angular 19/esbuild merges into `main.js`).
- **Spring Boot Routing Fix**: `HomeController` adjusted to `@GetMapping(value = {"", "/", "/{path:[^\\.]*}"})`, resolving 404 at `/`. Now forwards to `/browser/index.html`, rendering `MainMenuComponent`.
- **Verification**: `http://localhost:8080/` and `/browser/index.html` both display the styled main menu.

## Next Steps
1. **Frontend**: Style `GameSetupComponent` for player input (names, colors) with effects.
2. **Backend**: Define JPA entities (`Game`, `Player`, `Roll`) and REST APIs.
3. **Enhancements**: Add Chart.js for histograms in gameplay.
4. **Deployment**: Configure Railway with prod profile and volume.

## Setup Instructions
### Prerequisites
- Java 23, Node.js 20.11.0, npm 10.2.4, Angular CLI 19.x.
- Ubuntu (or compatible OS).

### Local Development
```bash
# Create local SQLite folder
mkdir data

# Build and run
cd dice-counter
mvn clean package
java -jar target/dice-counter-0.0.1-SNAPSHOT.jar
```