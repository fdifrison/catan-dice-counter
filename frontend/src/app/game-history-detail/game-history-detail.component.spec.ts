import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistoryDetailComponent } from './game-history-detail.component';

describe('GameHistoryDetailComponent', () => {
  let component: GameHistoryDetailComponent;
  let fixture: ComponentFixture<GameHistoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHistoryDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHistoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
