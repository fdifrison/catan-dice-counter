import { Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { GameSetupComponent } from './game-setup/game-setup.component';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'game-setup', component: GameSetupComponent },
  { path: 'gameplay', component: GameSetupComponent }, // Placeholder
  { path: 'history', component: MainMenuComponent }
];
