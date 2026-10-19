import { Routes } from '@angular/router';
import { SpotifyCallback } from './spotify-callback/spotify-callback';

export const routes: Routes = [
  {
    path: 'callback',
    component: SpotifyCallback
  }
];
