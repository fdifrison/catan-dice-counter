import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

interface Player {
  name: string;
  color: string;
  order: number;
  rank?: number;
  points?: number;
}

interface Roll {
  number: number;
  playerIndex: number;
}

interface Game {
  id: string;
  name: string;
  date: string;
  players: Player[];
  duration: number;
  rolls: Roll[];
}

@Component({
  selector: 'app-game-history-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-history-detail.component.html',
  styleUrls: ['./game-history-detail.component.css']
})
export class GameHistoryDetailComponent implements OnInit {
  game: Game | undefined;
  chart: Chart | undefined;
  chartType: 'bar' | 'roll-sequence' = 'bar';

  constructor(private route: ActivatedRoute, private router: Router) {
    const gameId = this.route.snapshot.paramMap.get('id');
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    this.game = history.find((g: Game) => g.id === gameId);
  }

  ngOnInit() {
    if (this.game) {
      this.initChart();
    }
  }

  initChart() {
    const ctx = document.getElementById('historyChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();

    if (this.chartType === 'bar') {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 11 }, (_, i) => (i + 2).toString()),
          datasets: this.getBarDatasets(),
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
              ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              min: 0,
              max: Math.max(4, ...this.game!.rolls.map(r => this.game!.rolls.filter(r2 => r2.number === r.number).length)),
              ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 },
              grid: { color: '#d4af37', lineWidth: 2 }
            }
          }
        }
      });
    } else {
      this.chart = new Chart(ctx, {
        type: 'bubble',
        data: {
          labels: this.game?.rolls.map((_, i) => `${i + 1}`) || [], // Y-axis: Turns
          datasets: this.game?.players.map((player, i) => ({
            label: player.name,
            data: this.game!.rolls.map(roll => roll.playerIndex === i ? roll.number : null), // Height = dice number
            backgroundColor: this.getPlayerColor(player.color),
            borderColor: '#000000',
            borderWidth: 1,
            categoryPercentage: 0.8,
            pointRadius: 6,
            order: this.game!.rolls.findIndex(r => r.playerIndex === i) // Stack order by first roll
          })).filter(ds => ds.data.some(val => val !== null)) || []
        },
        options: {
          indexAxis: 'y', // Horizontal bars
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false, position: 'bottom', labels: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#000000' } },
            title: { display: false }
          },
          scales: {
            x: { // Horizontal axis (dice numbers)
              title: { display: false, text: 'Dice Number', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' },
              ticks: {
                font: { family: 'Cinzel', size: 20, weight: 800 },
                color: '#d4af37',
                stepSize: 1
              },
              min: 1,
              max: 12,
              grid: { color: '#d4af37', lineWidth: 2 }
            },
            y: { // Vertical axis (turns)
              title: { display: false, text: 'Turn', font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37' },
              ticks: {
                font: { family: 'Cinzel', size: 20, weight: 800 },
                color: '#d4af37',
                callback: (value: number | string) => Number.isInteger(Number(value)) ? `${value}` : null
              },
              min: 0,
              max: (this.game?.rolls.length || 0) + 1,
              grid: { color: '#d4af37', lineWidth: 0.5}
            }
          }
        }
      });
    }
  }

  getBarDatasets() {
    const rollsByNumber: number[][] = Array.from({ length: 11 }, () => []);
    this.game?.rolls.forEach(roll => {
      rollsByNumber[roll.number - 2].push(roll.playerIndex);
    });

    return this.game?.players.map((player, i) => {
      const playerColor = this.getPlayerColor(player.color);
      const playerRolls = rollsByNumber.map(rolls => {
        const playerCount = rolls.filter(idx => idx === i).length;
        return playerCount > 0 ? playerCount : null;
      });
      return {
        label: player.name,
        data: playerRolls,
        backgroundColor: this.getPlayerColor(player.color),
        borderColor: '#000000',
        borderWidth: 1,
        categoryPercentage: 0.8,
      };
    }).filter(ds => ds.data.some(val => val !== null)) || [];
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

  createGradient(color: string): (context: any) => CanvasGradient {
    return (context: any) => {
      const ctx = context.chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 250);
      gradient.addColorStop(0, `${color}CC`);
      gradient.addColorStop(1, `${color}66`);
      return gradient;
    };
  }

  toggleChartType(type: 'bar' | 'roll-sequence') {
    this.chartType = type;
    this.initChart();
  }

  returnHome() {
    this.router.navigate(['/']);
  }
}
