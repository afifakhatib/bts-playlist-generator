import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-spotify-callback',
  standalone: true,
  template: `
    <main style="padding: 3rem; text-align: center">
      <h2>{{ message }}</h2>
    </main>
  `,
})
export class SpotifyCallback implements OnInit {
  private spotify = inject(SpotifyService);
  private router = inject(Router);

  message = 'Connecting to Spotify...';

  async ngOnInit(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    console.log('[HEARTBEAT callback]', {
      url: window.location.href.split('?')[0],
      hasCode: !!code,
      hasState: !!state,
      error: params.get('error'),
    });
    const error = params.get('error');

    if (error || !code || !state) {
      this.message = 'Spotify connection was cancelled or failed.';
      return;
    }

    try {
      await this.spotify.handleCallback(code, state);
      console.log('[HEARTBEAT] Token exchange completed');
      console.log('[HEARTBEAT] Connected:', this.spotify.isConnected());
      this.message = 'Spotify connected! Returning to HEARTBEAT...';
      await this.router.navigateByUrl('/');
    } catch (err) {
      this.message = err instanceof Error ? err.message : 'Spotify connection failed.';
    }
  }
}

// import { Component, OnInit, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { SpotifyService } from '../services/spotify.service';

// @Component({
//   selector: 'app-spotify-callback',
//   standalone: true,
//   template: `
//     <main style="padding: 3rem; text-align: center">
//       <h2>{{ message }}</h2>
//     </main>
//   `
// })
// export class SpotifyCallback implements OnInit {
//   private spotify = inject(SpotifyService);
//   private router = inject(Router);

//   message = 'Connecting to Spotify...';

//   async ngOnInit(): Promise<void> {
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get('code');
//     const state = params.get('state');
//     const error = params.get('error');

//     if (error) {
//       this.message = `Spotify authorization failed: ${error}`;
//       return;
//     }

//     if (!code || !state) {
//       this.message = 'Missing Spotify authorization details. Please try again.';
//       return;
//     }

//     try {
//       await this.spotify.handleCallback(code, state);

//       if (!this.spotify.isConnected()) {
//         throw new Error('Spotify token was not saved correctly.');
//       }

//       this.message = 'Spotify connected! Returning to HEARTBEAT...';
//       await this.router.navigateByUrl('/');
//     } catch (err) {
//       this.message = err instanceof Error
//         ? err.message
//         : 'Spotify connection failed.';
//     }
//   }
// }
