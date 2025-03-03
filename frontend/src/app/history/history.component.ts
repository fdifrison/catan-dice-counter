import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  games: any[] = [];
  showDeleteModal: boolean = false;
  gameToDelete: number | null = null;

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getAllGames().subscribe({
      next: (games) => {
        this.games = games;
      },
      error: (err) => {
        console.error('Failed to load games:', err);
        alert('Error loading game history.');
      }
    });
  }

  viewGameDetail(gameId: number) {
    this.router.navigate(['/game-history-detail', gameId]);
  }

  confirmDelete(gameId: number) {
    this.gameToDelete = gameId;
    this.showDeleteModal = true;
  }

  deleteGame(confirmed: boolean) {
    if (confirmed && this.gameToDelete) {
      this.gameService.deleteGame(this.gameToDelete).subscribe({
        next: () => {
          this.games = this.games.filter(game => game.id !== this.gameToDelete);
          this.showDeleteModal = false;
          this.gameToDelete = null;
        },
        error: (err) => {
          console.error('Failed to delete game:', err);
          alert('Error deleting game.');
        }
      });
    } else {
      this.showDeleteModal = false;
      this.gameToDelete = null;
    }
  }

  returnHome() {
    this.router.navigate(['/']);
  }
}
