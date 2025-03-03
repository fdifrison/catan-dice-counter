package com.fdifrison.catan.dicecounter.service;

import com.fdifrison.catan.dicecounter.domain.Game;
import com.fdifrison.catan.dicecounter.domain.Player;
import com.fdifrison.catan.dicecounter.domain.Roll;
import com.fdifrison.catan.dicecounter.domain.Turn;
import com.fdifrison.catan.dicecounter.dto.EndGameDTO;
import com.fdifrison.catan.dicecounter.dto.GameCreateDTO;
import com.fdifrison.catan.dicecounter.dto.GameDTO;
import com.fdifrison.catan.dicecounter.dto.TurnCreateDTO;
import com.fdifrison.catan.dicecounter.dto.TurnDTO;
import com.fdifrison.catan.dicecounter.mapper.GameMapper;
import com.fdifrison.catan.dicecounter.mapper.PlayerMapper;
import com.fdifrison.catan.dicecounter.mapper.TurnMapper;
import com.fdifrison.catan.dicecounter.repository.GameRepository;
import com.fdifrison.catan.dicecounter.repository.PlayerRepository;
import com.fdifrison.catan.dicecounter.repository.RollRepository;
import com.fdifrison.catan.dicecounter.repository.TurnRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;
    private final RollRepository rollRepository;
    private final TurnRepository turnRepository;
    private final GameMapper gameMapper;
    private final PlayerMapper playerMapper;
    private final TurnMapper turnMapper;

    public GameService(GameRepository gameRepository, PlayerRepository playerRepository,
                       RollRepository rollRepository, TurnRepository turnRepository,
                       GameMapper gameMapper, PlayerMapper playerMapper, TurnMapper turnMapper) {
        this.gameRepository = gameRepository;
        this.playerRepository = playerRepository;
        this.rollRepository = rollRepository;
        this.turnRepository = turnRepository;
        this.gameMapper = gameMapper;
        this.playerMapper = playerMapper;
        this.turnMapper = turnMapper;
    }

    public List<GameDTO> getAllGames() {
        return gameRepository.findAll().stream()
                .map(gameMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<GameDTO> getGameById(Long id) {
        return gameRepository.findById(id)
                .map(gameMapper::toDto);
    }

    public long calculateGameDuration(GameDTO game) {
        if (game.endTimestamp() == null || game.startTimestamp() == null) {
            return 0L;
        }
        return Duration.between(game.startTimestamp(), game.endTimestamp()).getSeconds();
    }

    public String findSlowestPlayer(Long gameId) {
        List<Turn> turns = turnRepository.findByGameId(gameId);
        Map<Long, Long> playerTurnDurations = turns.stream()
                .collect(Collectors.groupingBy(
                        turn -> turn.getPlayer().getId(),
                        Collectors.summingLong(turn ->
                                Duration.between(turn.getStartTimestamp(), turn.getEndTimestamp()).getSeconds())
                ));

        return playerTurnDurations.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> turns.stream()
                        .filter(t -> t.getPlayer().getId().equals(entry.getKey()))
                        .findFirst()
                        .map(t -> t.getPlayer().getName())
                        .orElse("Unknown"))
                .orElse("No turns recorded");
    }

    @Transactional
    public GameDTO createGame(GameCreateDTO gameCreateDTO) {
        Game game = gameMapper.toEntity(gameCreateDTO);
        List<Player> players = gameCreateDTO.players().stream()
                .map(playerMapper::toEntity)
                .peek(player -> player.setGame(game))
                .collect(Collectors.toList());
        game.setPlayers(players);
        Game savedGame = gameRepository.save(game);
        return gameMapper.toDto(savedGame);
    }

    @Transactional
    public TurnDTO recordTurn(Long gameId, TurnCreateDTO turnCreateDTO) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        Player player = playerRepository.findById(turnCreateDTO.playerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + turnCreateDTO.playerId()));

        Turn turn = turnMapper.toEntity(turnCreateDTO);
        turn.setGame(game);
        turn.setPlayer(player);

        if (turnCreateDTO.rollNumber() != null) {
            Roll roll = new Roll();
            roll.setGame(game);
            roll.setNumber(turnCreateDTO.rollNumber());
            roll.setPlayerIndex(player.getOrder());
            rollRepository.save(roll);
        }

        Turn savedTurn = turnRepository.save(turn);
        return turnMapper.toDto(savedTurn);
    }

    @Transactional
    public GameDTO endGame(Long gameId, EndGameDTO endGameDTO) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        game.setEndTimestamp(Instant.now());

        // Update player rankings and points
        endGameDTO.players().forEach(playerEnd -> {
            Player player = playerRepository.findById(playerEnd.id())
                    .orElseThrow(() -> new IllegalArgumentException("Player not found: " + playerEnd.id()));
            player.setRank(playerEnd.rank());
            player.setPoints(playerEnd.points());
            playerRepository.save(player);
        });

        Game savedGame = gameRepository.save(game);
        return gameMapper.toDto(savedGame);
    }

    @Transactional
    public void deleteGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        gameRepository.delete(game);
    }
}