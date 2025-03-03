import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game-history-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-history-detail.component.html',
  styleUrls: ['./game-history-detail.component.css']
})
export class GameHistoryDetailComponent implements OnInit {
  game: any = null;
  gameDuration: number = 0;
  chart: Chart | undefined;
  chartType: 'bar' | 'roll-sequence' | 'time-management' = 'bar';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {
    const gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameService.getGameById(gameId).subscribe({
      next: (game) => {
        this.game = game;
        this.gameService.getGameDuration(gameId).subscribe({
          next: (duration) => {
            this.gameDuration = duration;
            this.initChart();
          },
          error: (err) => console.error('Failed to fetch game duration:', err)
        });
      },
      error: (err) => {
        console.error('Failed to load game:', err);
        this.router.navigate(['/history']);
      }
    });
  }

  ngOnInit() {}

  initChart() {
    if (!this.game) return;
    console.log('Players:', this.game.players);
    console.log('Rolls:', this.game.rolls);
    console.log('Turns:', this.game.turns);
    const ctx = document.getElementById('historyChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();

    if (this.chartType === 'bar') {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 11 }, (_, i) => (i + 2).toString()),
          datasets: this.getBarDatasets()
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#000000' } },
            title: { display: false }
          },
          scales: {
            x: { stacked: true, ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' } },
            y: { stacked: true, beginAtZero: true, min: 0, max: Math.max(4, ...this.game.rolls.map((r: any) => this.game.rolls.filter((r2: any) => r2.number === r.number).length)), ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 }, grid: { color: '#d4af37', lineWidth: 2 } }
          }
        }
      });
    } else if (this.chartType === 'roll-sequence') {
      this.chart = new Chart(ctx, {
        type: 'bubble',
        data: {
          datasets: this.game.players.map((player: any) => ({
            label: player.name,
            data: this.game.turns
              .map((turn: any) => {
                const roll = this.game.rolls.find((r: any) => r.turnId === turn.id && r.playerIndex === (player.order - 1));
                return roll ? { x: roll.number, y: turn.turnNumber, r: 6 } : null;
              })
              .filter((d: any) => d !== null),
            backgroundColor: this.getPlayerColor(player.color),
            borderColor: '#000000',
            borderWidth: 1
          })).filter((ds: any) => ds.data.length > 0)
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#000000' } },
            title: { display: false }
          },
          scales: {
            x: { title: { display: true, text: 'Dice Outcome', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }, ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 }, min: 2, max: 12, grid: { color: '#d4af37', lineWidth: 2 } },
            y: { title: { display: true, text: 'Turn Number', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }, ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 }, min: 1, max: Math.max(...this.game.turns.map((t: any) => t.turnNumber)) + 1, grid: { color: '#d4af37', lineWidth: 0.5 } }
          }
        }
      });
    } else if (this.chartType === 'time-management') {
      const playerTimes = this.game.players.map((player: any) => {
        const playerTurns = this.game.turns.filter((t: any) => t.playerId === player.id);
        return playerTurns.reduce((sum: number, turn: any) => {
          return sum + (new Date(turn.endTimestamp).getTime() - new Date(turn.startTimestamp).getTime()) / 60000;
        }, 0);
      });

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.game.players.map((p: any) => p.name),
          datasets: [{
            label: 'Total Time Played (minutes)',
            data: playerTimes,
            backgroundColor: this.game.players.map((p: any) => this.getPlayerColor(p.color)),
            borderColor: '#000000',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Total Time Played by Player', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }
          },
          scales: {
            x: { ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }, grid: { display: false } },
            y: { ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 }, grid: { color: '#d4af37', lineWidth: 2 }, beginAtZero: true }
          }
        }
      });
    }
  }

  getBarDatasets() {
    const rollsByNumber: number[][] = Array.from({ length: 11 }, () => []);
    this.game.rolls.forEach((roll: any) => {
      rollsByNumber[roll.number - 2].push(roll.playerIndex);
    });
    console.log('Rolls by number:', rollsByNumber);
    return this.game.players.map((player: any) => {
      const playerColor = this.getPlayerColor(player.color);
      const playerRolls = rollsByNumber.map(rolls => rolls.filter(idx => idx === (player.order - 1)).length);
      return {
        label: player.name,
        data: playerRolls,
        backgroundColor: playerColor,
        borderColor: '#000000',
        borderWidth: 1,
        categoryPercentage: 0.8
      };
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

  toggleChartType(type: 'bar' | 'roll-sequence' | 'time-management') {
    this.chartType = type;
    this.initChart();
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  returnHome() {
    this.router.navigate(['/']);
  }
}
