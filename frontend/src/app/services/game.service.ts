import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

interface GlobalPlayer {
  id?: number;
  name: string;
  email: string;
}

interface Player {
  id?: number;
  globalPlayerId: number;
  color: string;
  order: number;
  rank?: number;
  points?: number;
}

interface Roll {
  id?: number;
  number: number;
  playerIndex: number;
}

interface Turn {
  id?: number;
  playerId: number;
  turnNumber: number;
  startTimestamp: string;
  endTimestamp: string;
}

interface Game {
  id?: number;
  name: string;
  startTimestamp: string;
  endTimestamp?: string;
  players: Player[];
  rolls: Roll[];
  turns: Turn[];
}

interface PlayerStats {
  totalPoints: number;
  averagePoints: number | null;
  luckyNumber: number | null;
  rollDistribution: { [key: number]: number };
  longestTurnSeconds: number | null;
  shortestTurnSeconds: number | null;
  averageTurnSeconds: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createGame(name: string, players: Player[]): Observable<Game> {
    const gameData = { name, players };
    return this.http.post<Game>(this.apiUrl, gameData);
  }

  recordTurn(gameId: number, turn: Turn): Observable<Turn> {
    return this.http.post<Turn>(`${this.apiUrl}/${gameId}/turns`, turn);
  }

  endGame(gameId: number, players: Player[]): Observable<Game> {
    const endGameData = { players: players.map(p => ({ id: p.id, rank: p.rank, points: p.points })) };
    return this.http.put<Game>(`${this.apiUrl}/${gameId}/end`, endGameData);
  }

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiUrl);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGameDuration(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/duration`);
  }

  getSlowestPlayer(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/slowest-player`, { responseType: 'text' as 'json' });
  }

  getAllGlobalPlayers(): Observable<GlobalPlayer[]> {
    return this.http.get<GlobalPlayer[]>(`${this.apiUrl}/players`);
  }

  createGlobalPlayer(player: GlobalPlayer): Observable<GlobalPlayer> {
    return this.http.post<GlobalPlayer>(`${this.apiUrl}/players`, player);
  }

  getPlayerStats(globalPlayerId: number): Observable<PlayerStats> {
    return this.http.get<PlayerStats>(`${this.apiUrl}/players/${globalPlayerId}/stats`);
  }
}
