import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Game {
  id: string;
  name: string;
  date: string;
  players: { name: string; color: string; order: number; rank?: number; points?: number }[];
  duration: number;
  rolls: { number: number; playerIndex: number }[];
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  games: Game[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Load existing history
    this.games = JSON.parse(localStorage.getItem('gameHistory') || '[]');

    // For testing: Clear and initialize mock data if empty
    if (this.games.length === 0) {
      console.log('No game history found, initializing mock data...');
      this.initializeMockData();
      this.games = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    }
    console.log('Loaded games:', this.games); // Debug log
  }

  initializeMockData() {
    const mockData: Game[] = [
      {
        id: '1',
        name: 'Catan Night 1',
        date: 'March 01, 2025',
        players: [
          { name: 'Alice', color: 'red', order: 1, rank: 1, points: 10 },
          { name: 'Bob', color: 'blue', order: 2, rank: 2, points: 8 },
          { name: 'Charlie', color: 'green', order: 3, rank: 3, points: 6 }
        ],
        duration: 3600, // 1 hour
        rolls: [
          { number: 7, playerIndex: 0 },
          { number: 6, playerIndex: 1 },
          { number: 8, playerIndex: 2 },
          { number: 5, playerIndex: 0 },
          { number: 9, playerIndex: 1 }
        ]
      },
      {
        id: '2',
        name: 'Catan Night 2',
        date: 'March 02, 2025',
        players: [
          { name: 'Dave', color: 'white', order: 1, rank: 2, points: 7 },
          { name: 'Eve', color: 'orange', order: 2, rank: 1, points: 12 }
        ],
        duration: 1800, // 30 minutes
        rolls: [
          { number: 4, playerIndex: 0 },
          { number: 10, playerIndex: 1 },
          { number: 3, playerIndex: 0 }
        ]
      }
    ];
    localStorage.setItem('gameHistory', JSON.stringify(mockData));
    console.log('Mock data initialized:', mockData);
  }

  viewGameDetail(gameId: string) {
    this.router.navigate(['/game-history-detail', gameId]);
  }
}
