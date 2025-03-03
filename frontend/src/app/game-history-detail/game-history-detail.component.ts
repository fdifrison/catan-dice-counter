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
  chart: Chart | undefined;
  chartType: 'bar' | 'roll-sequence' = 'bar';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {
    const gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameService.getGameById(gameId).subscribe({
      next: (game) => {
        this.game = game;
        this.initChart();  // Initialize chart after data is loaded
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
            x: {
              stacked: true,
              ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              min: 0,
              max: Math.max(4, ...this.game.rolls.map((r: any) => this.game.rolls.filter((r2: any) => r2.number === r.number).length)),
              ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 },
              grid: { color: '#d4af37', lineWidth: 2 }
            }
          }
        }
      });
    } else {
      // Roll-sequence chart logic can be added later if needed
    }
  }

  getBarDatasets() {
    const rollsByNumber: number[][] = Array.from({ length: 11 }, () => []);
    this.game.rolls.forEach((roll: any) => {
      rollsByNumber[roll.number - 2].push(roll.playerIndex);
    });
    return this.game.players.map((player: any, i: number) => {
      const playerColor = this.getPlayerColor(player.color);
      const playerRolls = rollsByNumber.map(rolls => rolls.filter(idx => idx === i).length || null);
      return {
        label: player.name,
        data: playerRolls,
        backgroundColor: playerColor,
        borderColor: '#000000',
        borderWidth: 1,
        categoryPercentage: 0.8
      };
    }).filter((ds: any) => ds.data.some((val: any) => val !== null));
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

  toggleChartType(type: 'bar' | 'roll-sequence') {
    this.chartType = type;
    this.initChart();
  }

  returnHome() {
    this.router.navigate(['/']);
  }
}
