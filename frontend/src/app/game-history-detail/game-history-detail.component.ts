import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
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
  chartType: 'bar' | 'line' = 'bar';

  constructor(private route: ActivatedRoute) {
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
          labels: Array.from({length: 11}, (_, i) => (i + 2).toString()),
          datasets: this.getBarDatasets()
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37'}
            },
            title: {display: false}
          },
          scales: {
            x: {
              stacked: true,
              ticks: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37'},
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37', stepSize: 1}
            }
          }
        }
      });
    } else {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.game?.rolls.map((_, i) => `Turn ${i + 1}`) || [],
          datasets: this.getLineDatasets()
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37'}
            },
            title: {display: false}
          },
          scales: {
            x: {ticks: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37'}},
            y: {
              min: 2,
              max: 12,
              ticks: {font: {family: 'Cinzel', size: 20, weight: 800}, color: '#d4af37', stepSize: 1}
            }
          }
        }
      });
    }
  }

  getBarDatasets() {
    const rollsByNumber: number[][] = Array.from({length: 11}, () => []);
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
        backgroundColor: this.createGradient(playerColor),
        borderColor: '#000000',
        borderWidth: 1
      };
    }).filter(ds => ds.data.some(val => val !== null)) || [];
  }

  getLineDatasets() {
    return this.game?.players.map((player, i) => {
      const playerRolls = this.game?.rolls
        .map((roll, index) => (roll.playerIndex === i ? {x: index + 1, y: roll.number} : null))
        .filter(r => r !== null) || [];
      return {
        label: player.name,
        data: playerRolls,
        borderColor: this.getPlayerColor(player.color),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1
      };
    }) || [];
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

  toggleChartType(type: 'bar' | 'line') {
    this.chartType = type;
    this.initChart();
  }
}
