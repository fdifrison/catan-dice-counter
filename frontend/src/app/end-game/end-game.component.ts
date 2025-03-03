import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import confetti from 'canvas-confetti';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-end-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent implements OnInit {
  game: any = null;
  endGameForm!: FormGroup;
  gameDuration: number = 0;
  showVictoryModal: boolean = false;
  winner: any | null = null;

  constructor(
    private router: Router,
    private gameService: GameService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.game = history.state.game;
    if (this.game) {
      this.endGameForm = this.fb.group({
        players: this.fb.array(this.game.players.map((p: any) => this.createPlayerFormGroup(p)))
      });
    } else {
      this.endGameForm = this.fb.group({
        players: this.fb.array([])
      });
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    if (this.game) {
      this.gameDuration = this.calculateDuration(this.game.startTimestamp, this.game.endTimestamp);
      this.cdr.detectChanges();
    }
  }

  createPlayerFormGroup(player: any): FormGroup {
    return this.fb.group({
      id: [player.id],
      name: [player.name],
      color: [player.color],
      order: [player.order],
      rank: [null, Validators.required],
      points: [null, [Validators.required, Validators.min(0)]]
    });
  }

  get players(): FormArray {
    return this.endGameForm.get('players') as FormArray;
  }

  getAvailableRanks(playerIndex: number): number[] {
    const totalPlayers = this.players.length;
    const usedRanks = this.players.controls
      .filter((_, i) => i !== playerIndex)
      .map(control => control.get('rank')?.value)
      .filter(r => r !== null);
    return Array.from({ length: totalPlayers }, (_, i) => i + 1)
      .filter(rank => !usedRanks.includes(rank));
  }

  confirmEndGame() {
    if (this.endGameForm.invalid) {
      this.endGameForm.markAllAsTouched();
      return;
    }

    const endGameData = this.players.value;

    this.gameService.endGame(this.game.id, endGameData).subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
        this.endGameForm.setControl('players', this.fb.array(updatedGame.players.map((p: any) => this.createPlayerFormGroup(p))));
        this.gameDuration = this.calculateDuration(updatedGame.startTimestamp, updatedGame.endTimestamp);
        console.log('Updated game duration:', this.gameDuration);
        this.cdr.detectChanges();
        const rankedPlayers = [...this.players.value].sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999));
        this.winner = rankedPlayers[0];
        this.showVictoryModal = true;
        this.startConfetti();
      },
      error: (err) => {
        console.error('Failed to end game:', err);
        alert('Error ending game: ' + (err.error || err.message));
      }
    });
  }

  calculateDuration(startTimestamp: string | undefined, endTimestamp: string | undefined): number {
    if (!startTimestamp || !endTimestamp) {
      console.log('Duration not calculated: startTimestamp=' + startTimestamp + ', endTimestamp=' + endTimestamp);
      return 0;
    }
    const start = new Date(startTimestamp).getTime();
    const end = new Date(endTimestamp).getTime();
    const duration = (end - start) / 1000;  // Convert to seconds
    console.log('Calculated duration:', duration);
    return duration;
  }

  startConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#8B0000', '#FFFFFF'],
      zIndex: 1002
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        zIndex: 1002
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        zIndex: 1002
      });
    }, 500);
  }

  goToMainMenu() {
    this.router.navigate(['/']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
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
}
