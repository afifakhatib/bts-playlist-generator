import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Home } from './home/home';
import { PlaylistCreator } from './playlist-creator/playlist-creator';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Home, PlaylistCreator, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('bts-playlist-generator');

  showPlaylistCreator = false;
  startCreating(): void {
    this.showPlaylistCreator = true;
    console.log('Create Playlist clicked!');
  }
}
