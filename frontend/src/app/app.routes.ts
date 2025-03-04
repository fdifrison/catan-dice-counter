import { Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { GameSetupComponent } from './game-setup/game-setup.component';
import { GameplayComponent } from './gameplay/gameplay.component';
import { EndGameComponent } from './end-game/end-game.component';
import { HistoryComponent } from './history/history.component';
import { GameHistoryDetailComponent } from './game-history-detail/game-history-detail.component';
import { PlayerStatisticsComponent } from './player-statistics/player-statistics.component';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'game-setup', component: GameSetupComponent },
  { path: 'gameplay', component: GameplayComponent },
  { path: 'end-game', component: EndGameComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'game-history-detail/:id', component: GameHistoryDetailComponent },
  { path: 'player-statistics', component: PlayerStatisticsComponent } // New route
];
