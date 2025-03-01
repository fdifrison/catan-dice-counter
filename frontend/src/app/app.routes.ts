import { Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },         // Root route
  { path: 'game-setup', component: MainMenuComponent }, // Placeholder
  { path: 'history', component: MainMenuComponent }     // Placeholder
];
