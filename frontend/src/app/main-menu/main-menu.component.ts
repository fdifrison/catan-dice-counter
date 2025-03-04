import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormsModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  showCreatePlayerModal: boolean = false;
  newPlayerName: string = '';
  newPlayerEmail: string = '';

  constructor(private router: Router, private gameService: GameService) {}

  startNewGame() {
    this.gameService.getAllGlobalPlayers().subscribe({
      next: (players) => {
        if (players.length < 2) {
          alert('At least 2 players are required to start a game.');
        } else {
          this.router.navigate(['/game-setup']);
        }
      },
      error: (err) => {
        console.error('Failed to fetch players:', err);
        alert('Error fetching players.');
      }
    });
  }

  createPlayer() {
    this.showCreatePlayerModal = true;
  }

  savePlayer() {
    if (!this.newPlayerName.trim() || !this.newPlayerEmail.trim()) {
      alert('Player name and email cannot be empty.');
      return;
    }
    const player = { name: this.newPlayerName, email: this.newPlayerEmail };
    this.gameService.createGlobalPlayer(player).subscribe({
      next: () => {
        this.showCreatePlayerModal = false;
        this.newPlayerName = '';
        this.newPlayerEmail = '';
      },
      error: (err) => {
        console.error('Failed to create player:', err);
        alert('Error creating player: ' + (err.error || err.message));
      }
    });
  }

  closeCreatePlayerModal() {
    this.showCreatePlayerModal = false;
    this.newPlayerName = '';
    this.newPlayerEmail = '';
  }

  viewHistory() {
    this.router.navigate(['/history']);
  }
}
