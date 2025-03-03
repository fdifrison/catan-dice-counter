import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

// Define interfaces to match backend DTOs
interface Player {
  id?: number;
  name: string;
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

@Injectable({
  providedIn: 'root'  // Makes the service available app-wide
})
export class GameService {
  // Base URL for the backend API, configurable for Railway
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Create a new game
  createGame(name: string, players: Player[]): Observable<Game> {
    const gameData = { name, players };
    return this.http.post<Game>(this.apiUrl, gameData);
  }

  // Record a turn
  recordTurn(gameId: number, turn: Turn): Observable<Turn> {
    return this.http.post<Turn>(`${this.apiUrl}/${gameId}/turns`, turn);
  }

  // End a game
  endGame(gameId: number, players: Player[]): Observable<Game> {
    const endGameData = { players: players.map(p => ({ id: p.id, rank: p.rank, points: p.points })) };
    return this.http.put<Game>(`${this.apiUrl}/${gameId}/end`, endGameData);
  }

  // Get all games (for history)
  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiUrl);
  }

  // Get a specific game by ID (for details)
  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  // Delete a game
  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get game duration
  getGameDuration(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/duration`);
  }

  // Get slowest player
  getSlowestPlayer(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/slowest-player`, { responseType: 'text' as 'json' });
  }
}
