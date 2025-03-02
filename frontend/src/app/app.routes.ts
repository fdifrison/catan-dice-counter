import { Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { GameSetupComponent } from './game-setup/game-setup.component';
import { GameplayComponent } from './gameplay/gameplay.component';
import { EndGameComponent } from './end-game/end-game.component';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'game-setup', component: GameSetupComponent },
  { path: 'gameplay', component: GameplayComponent },
  { path: 'end-game', component: EndGameComponent },
  { path: 'history', component: MainMenuComponent } // Placeholder
];
