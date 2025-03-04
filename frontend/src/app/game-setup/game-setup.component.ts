import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css']
})
export class GameSetupComponent implements OnInit {
  gameName: string = '';
  playerCount: number = 2;
  players: { globalPlayerId: number; order: number; color: string }[] = [];
  availablePlayers: any[] = [];
  showErrorModal: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getAllGlobalPlayers().subscribe({
      next: (players) => {
        this.availablePlayers = players;
        this.initializePlayers();
      },
      error: (err) => {
        console.error('Failed to fetch global players:', err);
        alert('Error loading players.');
      }
    });
  }

  initializePlayers() {
    this.players = [];
    const availableIds = this.availablePlayers.map(p => p.id);
    for (let i = 1; i <= this.playerCount && i <= availableIds.length; i++) {
      this.players.push({ globalPlayerId: availableIds[i - 1], order: i, color: 'red' });
    }
  }

  updatePlayers() {
    const currentCount = this.players.length;
    if (this.playerCount > this.availablePlayers.length) {
      this.showErrorModal = true;
      this.errorMessage = 'Not enough players available. Please create more players in the Main Menu.';
      this.playerCount = currentCount;
      return;
    }
    if (this.playerCount > currentCount) {
      const availableIds = this.availablePlayers
        .filter(p => !this.players.some(existing => existing.globalPlayerId === p.id))
        .map(p => p.id);
      for (let i = currentCount + 1; i <= this.playerCount && availableIds.length > 0; i++) {
        this.players.push({ globalPlayerId: availableIds.shift()!, order: i, color: 'red' });
      }
    } else if (this.playerCount < currentCount) {
      this.players = this.players.slice(0, this.playerCount);
    }
    this.players.forEach((p, i) => p.order = i + 1); // Reassign orders
  }

  isPlayerSelected(globalPlayerId: number, currentIndex: number): boolean {
    return this.players.some((p, i) => i !== currentIndex && p.globalPlayerId === globalPlayerId);
  }

  updatePlayerSelection(index: number) {
    const selectedPlayerId = this.players[index].globalPlayerId;
    const existingIndex = this.players.findIndex((p, i) => i !== index && p.globalPlayerId === selectedPlayerId);
    if (existingIndex !== -1) {
      const tempPlayer = { ...this.players[index] };
      this.players[index] = { ...this.players[existingIndex], order: index + 1 };
      this.players[existingIndex] = { ...tempPlayer, order: existingIndex + 1 };
    }
    this.players.forEach((p, i) => p.order = i + 1);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
    this.players.forEach((p, i) => p.order = i + 1); // Update order after drag
  }

  startGame() {
    if (!this.gameName.trim()) {
      this.showErrorModal = true;
      this.errorMessage = 'You need to set the game name!';
      return;
    }
    if (this.players.some(p => p.globalPlayerId === null || !p.color)) {
      this.showErrorModal = true;
      this.errorMessage = 'Please select a player and color for each slot.';
      return;
    }
    const colors = this.players.map(p => p.color);
    const uniqueColors = new Set(colors);
    if (uniqueColors.size !== colors.length) {
      this.showErrorModal = true;
      this.errorMessage = 'Each player must have a unique color!';
      return;
    }
    const gameData = {
      name: this.gameName,
      players: this.players.map(p => ({ globalPlayerId: p.globalPlayerId, order: p.order, color: p.color }))
    };
    this.gameService.createGame(this.gameName, gameData.players).subscribe({
      next: (game) => {
        this.router.navigate(['/gameplay'], { state: { game } });
      },
      error: (err) => {
        console.error('Failed to create game:', err);
        this.showErrorModal = true;
        this.errorMessage = err.error || 'Error creating game. Please check your input.';
      }
    });
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  getMutedColor(color: string): string {
    const mutedColors: { [key: string]: string } = {
      red: 'rgba(139, 0, 0, 0.8)',
      blue: 'rgba(0, 0, 139, 0.8)',
      green: 'rgba(0, 100, 0, 0.8)',
      white: 'rgba(245, 245, 245, 0.8)',
      orange: 'rgba(255, 140, 0, 0.8)'
    };
    return mutedColors[color] || 'rgba(0, 0, 0, 0.8)';
  }

  returnHome() {
    this.router.navigate(['/']); // Navigate back to main menu
  }
}
