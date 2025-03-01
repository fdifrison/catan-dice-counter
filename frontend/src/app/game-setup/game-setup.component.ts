import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PlayerColor = 'red' | 'blue' | 'orange' | 'white' | 'green'; // Union type

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
  players: { name: string; color: PlayerColor; order: number }[] = [
    { name: '', color: 'red', order: 1 },
    { name: '', color: 'blue', order: 2 },
    { name: '', color: 'green', order: 3 }
  ];

  constructor(private router: Router) {}

  updatePlayers() {
    const currentCount = this.players.length;
    if (this.playerCount > currentCount) {
      for (let i = currentCount + 1; i <= this.playerCount; i++) {
        this.players.push({ name: '', color: this.getDefaultColor(i), order: i });
      }
    } else if (this.playerCount < currentCount) {
      this.players = this.players.slice(0, this.playerCount);
    }
  }

  getDefaultColor(index: number): PlayerColor {
    const colors: PlayerColor[] = ['red', 'blue', 'green', 'white', 'orange'];
    return colors[index - 1] || 'orange';
  }

  getMutedColor(color: PlayerColor): string {
    const mutedColors: { [key in PlayerColor]: string } = {
      red: 'rgba(139, 0, 0, 0.6)',
      blue: 'rgba(0, 0, 139, 0.6)',
      green: 'rgba(0, 100, 0, 0.6)',
      white: 'rgba(245, 245, 245, 0.6)',
      orange: 'rgba(255, 140, 0, 0.6)'
    };
    return mutedColors[color]; // No fallback needed, all cases covered
  }

  updatePlayerColor(index: number) {
    // Future: Add color uniqueness check
  }

  startGame() {
    this.router.navigate(['/gameplay']);
  }
}
