package com.fdifrison.catan.dicecounter.controller;

import com.fdifrison.catan.dicecounter.dto.EndGameDTO;
import com.fdifrison.catan.dicecounter.dto.GameCreateDTO;
import com.fdifrison.catan.dicecounter.dto.GameDTO;
import com.fdifrison.catan.dicecounter.dto.TurnCreateDTO;
import com.fdifrison.catan.dicecounter.dto.TurnDTO;
import com.fdifrison.catan.dicecounter.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return gameService.getGameById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/duration")
    public ResponseEntity<Long> getGameDuration(@PathVariable Long id) {
        return gameService.getGameById(id)
                .map(game -> ResponseEntity.ok(gameService.calculateGameDuration(game)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/slowest-player")
    public ResponseEntity<String> getSlowestPlayer(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.findSlowestPlayer(id));
    }

    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameCreateDTO gameCreateDTO) {
        GameDTO createdGame = gameService.createGame(gameCreateDTO);
        return ResponseEntity.ok(createdGame);
    }

    @PostMapping("/{gameId}/turns")
    public ResponseEntity<TurnDTO> recordTurn(@PathVariable Long gameId, @RequestBody TurnCreateDTO turnCreateDTO) {
        TurnDTO recordedTurn = gameService.recordTurn(gameId, turnCreateDTO);
        return ResponseEntity.ok(recordedTurn);
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<GameDTO> endGame(@PathVariable Long id, @RequestBody EndGameDTO endGameDTO) {
        GameDTO endedGame = gameService.endGame(id, endGameDTO);
        return ResponseEntity.ok(endedGame);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}