import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-end-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent implements OnInit {
  game: any = null;
  players: any[] = [];
  gameDuration: number = 0;

  showVictoryModal: boolean = false;
  winner: any | null = null;

  constructor(private router: Router, private gameService: GameService) {
    this.game = history.state.game;
    if (this.game) {
      this.players = this.game.players.map((p: any) => ({ ...p, rank: undefined, points: 0 }));
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    if (this.game) {
      this.gameService.getGameDuration(this.game.id).subscribe({
        next: (duration) => this.gameDuration = duration,
        error: (err) => console.error('Failed to fetch game duration:', err)
      });
    }
  }

  getAvailableRanks(playerIndex: number): number[] {
    const totalPlayers = this.players.length;
    const usedRanks = this.players
      .filter((_, i) => i !== playerIndex)
      .map(p => p.rank)
      .filter(r => r !== undefined);
    return Array.from({ length: totalPlayers }, (_, i) => i + 1)
      .filter(rank => !usedRanks.includes(rank));
  }

  confirmEndGame() {
    this.gameService.endGame(this.game.id, this.players).subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
        this.players = updatedGame.players;
        // Fetch updated duration after ending the game
        this.gameService.getGameDuration(this.game.id).subscribe({
          next: (duration) => {
            this.gameDuration = duration;
            const rankedPlayers = [...this.players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
            this.winner = rankedPlayers[0];
            this.showVictoryModal = true;
            this.startConfetti();
          },
          error: (err) => console.error('Failed to fetch updated game duration:', err)
        });
      },
      error: (err) => {
        console.error('Failed to end game:', err);
        alert('Error ending game: ' + (err.error || err.message));
      }
    });
  }

  startConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#8B0000', '#FFFFFF'],
      zIndex: 1002
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        zIndex: 1002
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        zIndex: 1002
      });
    }, 500);
  }

  goToMainMenu() {
    this.router.navigate(['/']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  getPlayerColor(color: string): string {
    const colors: { [key: string]: string } = {
      red: '#FF0000',
      blue: '#0000FF',
      orange: '#FFA500',
      white: '#FFFFFF',
      green: '#008000'
    };
    return colors[color] || '#000000';
  }
}
