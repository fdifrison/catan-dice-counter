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

    console.log('Selected Player ID:', this.selectedPlayerId); // Debug selected ID
    this.gameService.getAllGames().subscribe({
      next: (games) => {
        console.log('All games:', games);
        const playerGames = games.filter((game: any) => {
          const match = game.players.some((p: any) => {
            const matchCondition = p.globalPlayerId === this.selectedPlayerId;
            console.log(`Checking player: globalPlayerId=${p.globalPlayerId}, selectedPlayerId=${this.selectedPlayerId}, match=${matchCondition}`);
            return matchCondition;
          });
          return match;
        });
        console.log('Player Games:', playerGames);

        if (playerGames.length === 0) {
          console.warn('No games found for globalPlayerId:', this.selectedPlayerId);
          this.luckyNumber = null;
          this.totalPoints = 0;
          this.averagePoints = null;
          this.initDiceRollChart({});
          this.initTurnTimeChart([], 0);
          return;
        }

        // Player data for points
        const playerData = playerGames.map((game: any) =>
          game.players.find((p: any) => p.globalPlayerId === this.selectedPlayerId)
        );
        console.log('Player Data:', playerData);
        this.totalPoints = playerData.reduce((sum: number, p: any) => sum + (p.points || 0), 0);
        this.averagePoints = playerData.length > 0 && this.totalPoints !== null ? this.totalPoints / playerData.length : null;

        // Rolls
        const rolls = playerGames.flatMap((game: any) => {
          const player = game.players.find((p: any) => p.globalPlayerId === this.selectedPlayerId);
          const playerIndex = player ? player.order - 1 : -1;
          return game.rolls.filter((r: any) => r.playerIndex === playerIndex);
        });
        const rollCounts: { [key: number]: number } = rolls.reduce((acc: { [key: number]: number }, roll: any) => {
          acc[roll.number] = (acc[roll.number] || 0) + 1;
          return acc;
        }, {});
        console.log('Rolls:', rolls, 'Roll Counts:', rollCounts);

        if (rolls.length > 0) {
          const rollEntries = Object.entries(rollCounts) as [string, number][];
          this.luckyNumber = Number(rollEntries.reduce((a: [string, number], b: [string, number]) => a[1] > b[1] ? a : b, ['0', 0])[0]);
        } else {
          this.luckyNumber = null;
        }

        // Turn times
        const turnDurations = playerGames.flatMap((game: any) => {
          const player = game.players.find((p: any) => p.globalPlayerId === this.selectedPlayerId);
          return game.turns
            .filter((t: any) => t.playerId === player?.id)
            .map((t: any) => (new Date(t.endTimestamp).getTime() - new Date(t.startTimestamp).getTime()) / 1000);
        });
        const totalTime = turnDurations.reduce((sum: number, time: number) => sum + time, 0) || 0;
        console.log('Turn Durations:', turnDurations, 'Total Time:', totalTime);

        this.initDiceRollChart(rollCounts);
        this.initTurnTimeChart(turnDurations, totalTime);
      },
      error: (err) => console.error('Failed to load games:', err)
    });
  }

  initTurnTimeChart(turnDurations: number[], totalTime: number) {
    const ctx = document.getElementById('turnTimeChart') as HTMLCanvasElement;
    if (this.turnTimeChart) this.turnTimeChart.destroy();

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    this.turnTimeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Longest', 'Shortest', 'Average'],
        datasets: [{
          label: 'Turn Times',
          data: [
            turnDurations.length > 0 ? Math.max(...turnDurations) : 0,
            turnDurations.length > 0 ? Math.min(...turnDurations) : 0,
            turnDurations.length > 0 ? totalTime / turnDurations.length : 0
          ],
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

  initDiceRollChart(rollCounts: { [key: number]: number }) {
    const ctx = document.getElementById('diceRollChart') as HTMLCanvasElement;
    if (this.diceRollChart) this.diceRollChart.destroy();

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    const rollData = Array.from({ length: 11 }, (_, i) => rollCounts[i + 2] || 0);
    console.log('Roll Data for Chart:', rollData);

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
