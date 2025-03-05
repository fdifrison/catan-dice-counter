import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.css']
})
export class GameplayComponent implements OnInit, OnDestroy {
  game: any = null;
  players: any[] = [];
  currentPlayerIndex: number = 0;
  diceRolls: any[] = [];
  chart: Chart | undefined;
  selectedNumber: number | null = null;
  turnDuration: number = 0;
  turnNumber: number = 1;
  timerInterval: any;
  showEndGameModal: boolean = false;
  showErrorModal: boolean = false; // New property for error modal
  turnStartTime: string | null = null;
  isTurnEnding: boolean = false;

  constructor(private router: Router, private gameService: GameService) {
    this.game = history.state.game;
    if (this.game) {
      this.players = this.game.players || [];
      this.diceRolls = this.game.rolls || [];
    } else {
      this.router.navigate(['/']);
    }
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
          legend: { display: true, position: 'bottom', labels: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: 'rgba(21,16,16,1)' } },
          title: { display: false }
        },
        scales: {
          x: { stacked: true, ticks: { font: { family: 'Cinzel', size: 20, weight: 1000 }, color: '#d4af37' } },
          y: { stacked: true, beginAtZero: true, ticks: { font: { family: 'Cinzel', size: 20, weight: 800 }, color: '#d4af37', stepSize: 1 }, grid: { color: '#d4af37', lineWidth: 1 } }
        }
      }
    });
  }

  getStackedDatasets() {
    const rollsByNumber: number[][] = Array.from({ length: 11 }, () => []);
    this.diceRolls.forEach(roll => {
      rollsByNumber[roll.number - 2].push(roll.playerIndex);
    });
    if (this.selectedNumber) {
      rollsByNumber[this.selectedNumber - 2].push(this.currentPlayerIndex);
    }
    const datasets = this.players.map((player, i) => {
      const playerColor = this.getPlayerColor(player.color);
      const playerRolls = rollsByNumber.map(rolls => rolls.filter(idx => idx === i).length || null);
      return {
        label: player.name,
        data: playerRolls,
        backgroundColor: playerColor,
        borderColor: '#000000',
        borderWidth: 1
      };
    });
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

  rollDice(number: number) {
    this.selectedNumber = number;
    this.updateChart();
  }

  endTurn() {
    if (this.isTurnEnding) return;

    // Check if a number was selected
    if (this.selectedNumber === null) {
      this.showErrorModal = true; // Show error modal
      return;
    }

    this.isTurnEnding = true;

    const turn = {
      playerId: this.players[this.currentPlayerIndex].id,
      turnNumber: this.turnNumber,
      startTimestamp: this.turnStartTime!,
      endTimestamp: new Date().toISOString(),
      rollNumber: this.selectedNumber
    };

    this.gameService.recordTurn(this.game.id, turn).subscribe({
      next: (recordedTurn) => {
        if (this.selectedNumber) {
          this.diceRolls.push({ number: this.selectedNumber, playerIndex: this.currentPlayerIndex });
        }
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.selectedNumber = null;
        this.turnNumber++;
        this.resetTimer();
        this.updateChart();
        this.isTurnEnding = false;
      },
      error: (err) => {
        console.error('Failed to record turn:', err);
        alert('Error recording turn.');
        this.isTurnEnding = false;
      }
    });
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.turnDuration = 0;
    this.turnStartTime = new Date().toISOString();
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
      this.router.navigate(['/end-game'], { state: { game: this.game } });
    }
  }

  closeErrorModal() {
    this.showErrorModal = false; // Close error modal
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.datasets = this.getStackedDatasets();
      this.chart.update();
    }
  }
}
