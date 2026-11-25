import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyPlaylistSetup } from './spotify-playlist-setup';

describe('SpotifyPlaylistSetup', () => {
  let component: SpotifyPlaylistSetup;
  let fixture: ComponentFixture<SpotifyPlaylistSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyPlaylistSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyPlaylistSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
