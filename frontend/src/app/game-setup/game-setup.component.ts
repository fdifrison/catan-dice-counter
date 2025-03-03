import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

type PlayerColor = 'red' | 'blue' | 'orange' | 'white' | 'green';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css']
})
export class GameSetupComponent {
  gameName: string = '';
  playerCount: number = 3;
  // Updated type to include order
  players: { name: string; color: PlayerColor; order: number }[] = [
    { name: '', color: 'red', order: 1 },
    { name: '', color: 'blue', order: 2 },
    { name: '', color: 'green', order: 3 }
  ];
  availableColors: PlayerColor[] = ['red', 'blue', 'green', 'white', 'orange'];

  constructor(private router: Router, private gameService: GameService) {}

  updatePlayers() {
    const currentCount = this.players.length;
    if (this.playerCount > currentCount) {
      for (let i = currentCount + 1; i <= this.playerCount; i++) {
        const nextColor = this.getNextAvailableColor();
        this.players.push({ name: '', color: nextColor, order: i });
      }
    } else if (this.playerCount < currentCount) {
      this.players = this.players.slice(0, this.playerCount);
    }
    this.updateAvailableColors();
  }

  getNextAvailableColor(): PlayerColor {
    const usedColors = this.players.map(p => p.color);
    const available = this.availableColors.find(color => !usedColors.includes(color));
    return available || 'orange';
  }

  getMutedColor(color: PlayerColor): string {
    const mutedColors: { [key in PlayerColor]: string } = {
      red: 'rgba(139, 0, 0, 0.8)',
      blue: 'rgba(0, 0, 139, 0.8)',
      green: 'rgba(0, 100, 0, 0.8)',
      white: 'rgba(245, 245, 245, 0.8)',
      orange: 'rgba(255, 140, 0, 0.8)'
    };
    return mutedColors[color];
  }

  updatePlayerColor(index: number) {
    const oldColor = this.players[index].color;
    const newColor = this.players[index].color;
    const usedColors = this.players.map(p => p.color).filter((c, i) => i !== index);
    if (usedColors.includes(newColor)) {
      const available = this.availableColors.find(c => !usedColors.includes(c) && c !== newColor);
      if (available) {
        const swappedPlayer = this.players.find((p, i) => i !== index && p.color === newColor);
        if (swappedPlayer) swappedPlayer.color = oldColor;
      }
    }
    this.updateAvailableColors();
  }

  updateAvailableColors() {
    const usedColors = this.players.map(p => p.color);
    this.availableColors = (['red', 'blue', 'green', 'white', 'orange'] as PlayerColor[]).filter(c => !usedColors.includes(c));
  }

  getAvailableColorsForPlayer(index: number): PlayerColor[] {
    const usedColors = this.players.map(p => p.color).filter((c, i) => i !== index);
    return (['red', 'blue', 'green', 'white', 'orange'] as PlayerColor[]).filter(c => !usedColors.includes(c) || c === this.players[index].color);
  }

  startGame() {
    // Call the API to create the game
    this.gameService.createGame(this.gameName, this.players).subscribe({
      next: (game) => {
        // Pass the game data to the gameplay component
        this.router.navigate(['/gameplay'], { state: { game } });
      },
      error: (err) => {
        console.error('Failed to create game:', err);
        alert('Error creating game. Please try again.');
      }
    });
  }
}
