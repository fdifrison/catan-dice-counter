import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage], // Basic Angular features
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  constructor(private router: Router) {}

  startNewGame() {
    this.router.navigate(['/game-setup']);
  }

  viewHistory() {
    this.router.navigate(['/history']);
  }
}
