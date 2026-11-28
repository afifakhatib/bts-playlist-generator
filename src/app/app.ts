// import { Component, Input, signal } from '@angular/core';
// import { Home } from './home/home';
// import { PlaylistCreator } from './playlist-creator/playlist-creator';
// import { SpotifyPlaylistSetup } from './spotify-playlist-setup/spotify-playlist-setup';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [Home, PlaylistCreator, SpotifyPlaylistSetup, RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.scss',
// })
// export class App {
//   protected readonly title = signal('bts-playlist-generator');

//   showPlaylistCreator = false;
//   showSpotifyPlaylistSetup = false;

//   generatedTracks: string[] = [];
//   handlePlaylistGenerated(tracks: string[]): void {
//     this.generatedTracks = tracks;
//     this.showSpotifyPlaylistSetup = true;
//   }

//   startCreating(): void {
//     this.showPlaylistCreator = true;
//     console.log('Create Playlist clicked!');
//   }

// }

import { Component, signal } from '@angular/core';
import { Home } from './home/home';
import { PlaylistCreator } from './playlist-creator/playlist-creator';
import { SpotifyPlaylistSetup } from './spotify-playlist-setup/spotify-playlist-setup';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Home, PlaylistCreator, SpotifyPlaylistSetup, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('bts-playlist-generator');

  showPlaylistCreator = false;
  showSpotifyPlaylistSetup = false;

  isPlaying = false;

  generatedTracks: string[] = [];

  handlePlaylistGenerated(tracks: string[]): void {
    this.generatedTracks = tracks;
    this.showSpotifyPlaylistSetup = true;
  }

  startCreating(): void {
    this.showPlaylistCreator = true;
    console.log('Create Playlist clicked!');
  }

  // async toggleMusic(audio: HTMLAudioElement): Promise<void> {
  //   if (audio.paused) {
  //     try {
  //       await audio.play();
  //       this.isPlaying = true;
  //     } catch (error) {
  //       console.error('Music playback failed:', error);
  //       this.isPlaying = false;
  //     }
  //   } else {
  //     audio.pause();
  //     this.isPlaying = false;
  //   }
  // }
  async toggleMusic(audio: HTMLAudioElement): Promise<void> {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      console.error('Music playback failed:', error);
    }
  } else {
    audio.pause();
  }
}
}
