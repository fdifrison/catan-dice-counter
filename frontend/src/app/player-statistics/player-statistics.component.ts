import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-player-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-statistics.component.html',
  styleUrls: ['./player-statistics.component.css']
})
export class PlayerStatisticsComponent implements OnInit {
  players: any[] = [];
  selectedPlayerId: number | null = null;
  luckyNumber: number | null = null;
  totalPoints: number | null = null;
  averagePoints: number | null = null;
  turnTimeChart: Chart | undefined;
  diceRollChart: Chart | undefined;

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getAllGlobalPlayers().subscribe({
      next: (players) => {
        this.players = players;
        console.log('Loaded players:', players);
      },
      error: (err) => console.error('Failed to load players:', err)
    });
  }

  loadPlayerStats() {
    if (!this.selectedPlayerId) return;

    console.log('Fetching stats for globalPlayerId:', this.selectedPlayerId);
    this.gameService.getPlayerStats(this.selectedPlayerId).subscribe({
      next: (stats) => {
        console.log('Received player stats:', stats);

        this.totalPoints = stats.totalPoints;
        this.averagePoints = stats.averagePoints;
        this.luckyNumber = stats.luckyNumber;

        const rollData = Array.from({ length: 11 }, (_, i) => stats.rollDistribution[i + 2] || 0);
        this.initDiceRollChart(rollData);

        const turnData = [
          stats.longestTurnSeconds || 0,
          stats.shortestTurnSeconds || 0,
          stats.averageTurnSeconds || 0
        ];
        this.initTurnTimeChart(turnData);
      },
      error: (err) => console.error('Failed to load player stats:', err)
    });
  }

  initTurnTimeChart(turnData: number[]) {
    const ctx = document.getElementById('turnTimeChart') as HTMLCanvasElement;
    if (this.turnTimeChart) this.turnTimeChart.destroy();

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    this.turnTimeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Longest', 'Shortest', 'Average'],
        datasets: [{
          label: 'Turn Times',
          data: turnData,
          backgroundColor: this.getPlayerColor(player?.color || 'red'),
          borderColor: '#000000',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Turn Time Analysis', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${this.formatTurnTime(context.raw as number)}`
            }
          }
        },
        scales: {
          x: { ticks: { font: { family: 'Cinzel', size: 16, weight: 800 }, color: '#d4af37' }, grid: { display: false } },
          y: {
            ticks: {
              font: { family: 'Cinzel', size: 20, weight: 800 },
              color: '#d4af37',
              callback: (value) => this.formatTurnTime(value as number)
            },
            grid: { color: '#d4af37', lineWidth: 2 },
            beginAtZero: true
          }
        }
      }
    });
  }

  initDiceRollChart(rollData: number[]) {
    const ctx = document.getElementById('diceRollChart') as HTMLCanvasElement;
    if (this.diceRollChart) this.diceRollChart.destroy();

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    this.diceRollChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 11 }, (_, i) => (i + 2).toString()),
        datasets: [{
          label: `${player?.name || 'Player'}'s Roll Distribution`,
          data: rollData,
          backgroundColor: this.getPlayerColor(player?.color || 'red'),
          borderColor: '#000000',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#000000' } },
          title: { display: true, text: 'Dice Roll Distribution', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }
        },
        scales: {
          x: { ticks: { font: { family: 'Cinzel', size: 16, weight: 800 }, color: '#d4af37' }, grid: { display: false } },
          y: {
            ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 },
            grid: { color: '#d4af37', lineWidth: 2 },
            beginAtZero: true
          }
        }
      }
    });
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

  formatTurnTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  returnHome() {
    this.router.navigate(['/']);
  }
}
