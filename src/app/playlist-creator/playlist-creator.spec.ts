import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistCreator } from './playlist-creator';

describe('PlaylistCreator', () => {
  let component: PlaylistCreator;
  let fixture: ComponentFixture<PlaylistCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistCreator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistCreator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
