import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByRank',
  standalone: true
})
export class SortByRankPipe implements PipeTransform {
  transform(players: any[]): any[] {
    return players.slice().sort((a, b) => (a.rank || 999) - (b.rank || 999));
  }
}
