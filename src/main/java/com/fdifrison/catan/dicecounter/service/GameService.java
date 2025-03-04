package com.fdifrison.catan.dicecounter.service;

import com.fdifrison.catan.dicecounter.domain.Game;
import com.fdifrison.catan.dicecounter.domain.GlobalPlayer;
import com.fdifrison.catan.dicecounter.domain.Player;
import com.fdifrison.catan.dicecounter.domain.Roll;
import com.fdifrison.catan.dicecounter.domain.Turn;
import com.fdifrison.catan.dicecounter.dto.EndGameDTO;
import com.fdifrison.catan.dicecounter.dto.GameCreateDTO;
import com.fdifrison.catan.dicecounter.dto.GameDTO;
import com.fdifrison.catan.dicecounter.dto.GlobalPlayerDTO;
import com.fdifrison.catan.dicecounter.dto.PlayerEndDTO;
import com.fdifrison.catan.dicecounter.dto.TurnCreateDTO;
import com.fdifrison.catan.dicecounter.dto.TurnDTO;
import com.fdifrison.catan.dicecounter.mapper.GameMapper;
import com.fdifrison.catan.dicecounter.mapper.GlobalPlayerMapper;
import com.fdifrison.catan.dicecounter.mapper.PlayerMapper;
import com.fdifrison.catan.dicecounter.mapper.TurnMapper;
import com.fdifrison.catan.dicecounter.repository.GameRepository;
import com.fdifrison.catan.dicecounter.repository.GlobalPlayerRepository;
import com.fdifrison.catan.dicecounter.repository.PlayerRepository;
import com.fdifrison.catan.dicecounter.repository.RollRepository;
import com.fdifrison.catan.dicecounter.repository.TurnRepository;
import jakarta.validation.Valid;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Validated
@Service
public class GameService {

    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;
    private final GlobalPlayerRepository globalPlayerRepository;
    private final RollRepository rollRepository;
    private final TurnRepository turnRepository;
    private final GameMapper gameMapper;
    private final PlayerMapper playerMapper;
    private final GlobalPlayerMapper globalPlayerMapper;
    private final TurnMapper turnMapper;

    public GameService(GameRepository gameRepository, PlayerRepository playerRepository,
                       GlobalPlayerRepository globalPlayerRepository, RollRepository rollRepository,
                       TurnRepository turnRepository, GameMapper gameMapper, PlayerMapper playerMapper,
                       GlobalPlayerMapper globalPlayerMapper, TurnMapper turnMapper) {
        this.gameRepository = gameRepository;
        this.playerRepository = playerRepository;
        this.globalPlayerRepository = globalPlayerRepository;
        this.rollRepository = rollRepository;
        this.turnRepository = turnRepository;
        this.gameMapper = gameMapper;
        this.playerMapper = playerMapper;
        this.globalPlayerMapper = globalPlayerMapper;
        this.turnMapper = turnMapper;
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getAllGames() {
        List<Game> games = gameRepository.findAll();
        games.forEach(game -> {
            Hibernate.initialize(game.getPlayers());
            Hibernate.initialize(game.getRolls());
            Hibernate.initialize(game.getTurns());
        });
        return games.stream()
                .map(gameMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<GameDTO> getGameById(Integer id) {
        return gameRepository.findById(id)
                .map(game -> {
                    Hibernate.initialize(game.getPlayers());
                    Hibernate.initialize(game.getRolls());
                    Hibernate.initialize(game.getTurns());
                    return gameMapper.toDto(game);
                });
    }

    @Transactional(readOnly = true)
    public List<GlobalPlayerDTO> getAllGlobalPlayers() {
        return globalPlayerRepository.findAll().stream()
                .map(globalPlayerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public GlobalPlayerDTO createGlobalPlayer(GlobalPlayerDTO globalPlayerDTO) {
        GlobalPlayer globalPlayer = globalPlayerMapper.toEntity(globalPlayerDTO);
        globalPlayer.setId(UUID.randomUUID().hashCode());
        GlobalPlayer savedPlayer = globalPlayerRepository.save(globalPlayer);
        return globalPlayerMapper.toDto(savedPlayer);
    }

    public long calculateGameDuration(GameDTO game) {
        if (game.endTimestamp() == null || game.startTimestamp() == null) {
            System.out.println("Game duration not calculated: endTimestamp=" + game.endTimestamp() + ", startTimestamp=" + game.startTimestamp());
            return 0L;
        }
        long duration = Duration.between(game.startTimestamp(), game.endTimestamp()).getSeconds();
        System.out.println("Calculated game duration: " + duration + " seconds");
        return duration;
    }

    public String findSlowestPlayer(Integer gameId) {
        List<Turn> turns = turnRepository.findByGameId(gameId);
        Map<Integer, Long> playerTurnDurations = turns.stream()
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
                        .map(t -> t.getPlayer().getGlobalPlayer().getName())
                        .orElse("Unknown"))
                .orElse("No turns recorded");
    }

    @Transactional
    public GameDTO createGame(@Valid GameCreateDTO gameCreateDTO) {
        System.out.println("Starting createGame at " + Instant.now());
        Game game = gameMapper.toEntity(gameCreateDTO);
        int gameId = UUID.randomUUID().hashCode();
        game.setId(gameId);
        List<Player> players = gameCreateDTO.players().stream()
                .map(dto -> {
                    Player player = playerMapper.toEntity(dto);
                    GlobalPlayer globalPlayer = globalPlayerRepository.findById(dto.globalPlayerId())
                            .orElseThrow(() -> new IllegalArgumentException("Global player not found: " + dto.globalPlayerId()));
                    player.setGlobalPlayer(globalPlayer);
                    player.setGame(game);
                    player.setId(UUID.randomUUID().hashCode());
                    System.out.println("Created player: id=" + player.getId() + ", globalPlayerId=" + dto.globalPlayerId() + ", order=" + player.getOrder() + ", color=" + player.getColor());
                    return player;
                })
                .collect(Collectors.toList());
        game.setPlayers(players);
        Game savedGame = gameRepository.save(game);
        System.out.println("Finished createGame at " + Instant.now());
        return gameMapper.toDto(savedGame);
    }

    @Transactional
    public TurnDTO recordTurn(Integer gameId, @Valid TurnCreateDTO turnCreateDTO) {
        System.out.println("Starting recordTurn for gameId: " + gameId + " at " + Instant.now());
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        Player player = playerRepository.findById(turnCreateDTO.playerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + turnCreateDTO.playerId()));

        Turn turn = turnMapper.toEntity(turnCreateDTO);
        int turnId = UUID.randomUUID().hashCode();
        turn.setId(turnId);
        turn.setGame(game);
        turn.setPlayer(player);

        Turn savedTurn = turnRepository.save(turn);

        if (turnCreateDTO.rollNumber() != null) {
            Roll roll = new Roll();
            roll.setId(UUID.randomUUID().hashCode());
            roll.setGame(game);
            roll.setTurn(savedTurn);
            roll.setNumber(turnCreateDTO.rollNumber());
            roll.setPlayerIndex(player.getOrder() - 1);  // 0-based index
            System.out.println("Saved roll: id=" + roll.getId() + ", gameId=" + gameId + ", turnId=" + turnId + ", number=" + roll.getNumber() + ", playerIndex=" + roll.getPlayerIndex());
            rollRepository.save(roll);
        }

        System.out.println("Finished recordTurn for gameId: " + gameId + " at " + Instant.now());
        return turnMapper.toDto(savedTurn);
    }

    @Transactional
    public GameDTO endGame(Integer gameId, @Valid EndGameDTO endGameDTO) {
        System.out.println("Starting endGame for gameId: " + gameId + " at " + Instant.now());
        System.out.println("Received endGameDTO: " + endGameDTO);
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        game.setEndTimestamp(Instant.now());

        endGameDTO.players().forEach(playerEnd -> {
            Player player = playerRepository.findById(playerEnd.id())
                    .orElseThrow(() -> new IllegalArgumentException("Player not found: " + playerEnd.id()));
            System.out.println("Updating player " + playerEnd.id() + " with rank: " + playerEnd.rank());
            player.setRank(playerEnd.rank());
            player.setPoints(playerEnd.points());
            playerRepository.save(player);
        });

        Game savedGame = gameRepository.save(game);
        Hibernate.initialize(savedGame.getPlayers());
        Hibernate.initialize(savedGame.getRolls());
        Hibernate.initialize(savedGame.getTurns());
        GameDTO gameDTO = gameMapper.toDto(savedGame);
        System.out.println("EndGame DTO: endTimestamp=" + gameDTO.endTimestamp() + ", startTimestamp=" + gameDTO.startTimestamp());
        System.out.println("Finished endGame for gameId: " + gameId + " at " + Instant.now());
        return gameDTO;
    }

    @Transactional
    public void deleteGame(Integer gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
        gameRepository.delete(game);
    }
}