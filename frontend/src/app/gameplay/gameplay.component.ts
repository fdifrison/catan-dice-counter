import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

interface Player {
  name: string;
  color: string;
  order: number; // Kept for compatibility, though unused now
}

interface Roll {
  number: number;
  playerIndex: number;
}

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  currentPlayerIndex: number = 0;
  diceRolls: Roll[] = [];
  pendingRoll: Roll | null = null;
  chart: Chart | undefined;
  selectedNumber: number | null = null;
  turnDuration: number = 0;
  turnNumber: number = 1;
  timerInterval: any;
  showEndGameModal: boolean = false;
  gameName: string = ''; // Added to store game name

  constructor(private router: Router) {
    const setupData = JSON.parse(localStorage.getItem('gameSetup') || '{}');
    this.players = setupData.players || [
      { name: 'Player 1', color: 'red', order: 1 },
      { name: 'Player 2', color: 'blue', order: 2 },
      { name: 'Player 3', color: 'orange', order: 3 },
      { name: 'Player 4', color: 'green', order: 4 },
      { name: 'Player 5', color: 'white', order: 5 }
    ];
    this.gameName = setupData.gameName || 'Default Game'; // Pull game name from setup
  }

  ngOnInit() {
    this.initChart();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  initChart() {
    const ctx = document.getElementById('diceChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 11 }, (_, i) => (i + 2).toString()),
        datasets: this.getStackedDatasets()
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { family: 'Cinzel', size: 20, weight: 800},
              color: 'rgba(21,16,16,0.2)'
            }
          },
          title: { display: false }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              font: { family: 'Cinzel', size: 20, weight: 1000 },
              color: '#d4af37'
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              font: { family: 'Cinzel', size: 20, weight: 800 },
              color: '#d4af37',
              stepSize: 1
            }
          }
        }
      }
    });
  }

  getStackedDatasets() {
    const rollsByNumber: number[][] = Array.from({ length: 11 }, () => []);
    this.diceRolls.forEach(roll => {
      rollsByNumber[roll.number - 2].push(roll.playerIndex);
    });
    if (this.pendingRoll) {
      rollsByNumber[this.pendingRoll.number - 2].push(this.pendingRoll.playerIndex);
    }

    const datasets = [];
    for (let i = 0; i < this.players.length; i++) {
      const playerColor = this.getPlayerColor(this.players[i].color);
      const playerRolls = rollsByNumber.map(rolls => {
        const playerCount = rolls.filter(idx => idx === i).length;
        return playerCount > 0 ? playerCount : null;
      });
      datasets.push({
        label: this.players[i].name,
        data: playerRolls,
        backgroundColor: this.createGradient(playerColor),
        borderColor: '#000000',
        borderWidth: 1
      });
    }
    return datasets.filter(ds => ds.data.some(val => val !== null));
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

  rollDice(number: number) {
    this.selectedNumber = number;
    this.pendingRoll = { number, playerIndex: this.currentPlayerIndex };
    this.updateChart();
    this.resetTimer();
  }

  endTurn() {
    if (this.pendingRoll) {
      this.diceRolls.push(this.pendingRoll);
      this.pendingRoll = null;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.selectedNumber = null;
    this.turnNumber++;
    this.resetTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.turnDuration = 0;
    this.timerInterval = setInterval(() => {
      this.turnDuration++;
    }, 1000);
  }

  resetTimer() {
    this.startTimer();
  }

  showEndGameConfirmation() {
    this.showEndGameModal = true;
  }

  endGame(confirmed: boolean) {
    this.showEndGameModal = false;
    if (confirmed) {
      const gameData = {
        players: this.players,
        rolls: this.diceRolls,
        duration: this.diceRolls.reduce((acc, roll, idx) => acc + (idx + 1) * 10, 0),
        gameName: this.gameName // Pass game name to end-game
      };
      localStorage.setItem('gameplayData', JSON.stringify(gameData));
      this.router.navigate(['/end-game']);
    }
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.datasets = this.getStackedDatasets();
      this.chart.update();
    }
  }
}
