import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';

interface Player {
  name: string;
  color: string;
  order: number;
  rank?: number;
  points?: number;
}

interface Roll {
  number: number;
  playerIndex: number;
}

@Component({
  selector: 'app-end-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent implements OnInit {
  players: Player[] = [];
  gameDuration: number = 0;
  showVictoryModal: boolean = false;
  winner: Player | null = null;

  constructor(private router: Router) {
    const gameplayData = JSON.parse(localStorage.getItem('gameplayData') || '{}');
    this.players = gameplayData.players || [
      { name: 'Player 1', color: 'red', order: 1 },
      { name: 'Player 2', color: 'blue', order: 2 },
      { name: 'Player 3', color: 'orange', order: 3 }
    ];
    this.gameDuration = gameplayData.duration || 0;
    this.players.forEach(player => {
      player.rank = undefined; // Start with no ranks assigned
      player.points = player.points || 0;
    });
  }

  ngOnInit() {}

  getAvailableRanks(playerIndex: number): number[] {
    const totalPlayers = this.players.length;
    const usedRanks = this.players
      .filter((_, i) => i !== playerIndex)
      .map(p => p.rank)
      .filter(r => r !== undefined) as number[];
    return Array.from({ length: totalPlayers }, (_, i) => i + 1)
      .filter(rank => !usedRanks.includes(rank));
  }

  confirmEndGame() {
    const rankedPlayers = [...this.players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    this.winner = rankedPlayers[0];
    this.showVictoryModal = true;
    this.startConfetti();
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
    const gameData = {
      id: Date.now().toString(),
      name: JSON.parse(localStorage.getItem('gameplayData') || '{}').gameName || 'Unnamed Game',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      players: this.players,
      duration: this.gameDuration,
      rolls: JSON.parse(localStorage.getItem('gameplayData') || '{}').rolls || []
    };
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    history.push(gameData);
    localStorage.setItem('gameHistory', JSON.stringify(history));
    localStorage.setItem('lastGame', JSON.stringify(gameData));
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
