import { Injectable } from '@angular/core';

const CLIENT_ID = '2ab479a84eba48328cf3c7f897df014b';
// const REDIRECT_URI = 'http://127.0.0.1:4200/callback';
const REDIRECT_URI = `${window.location.origin}/callback`;

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images?: { url: string }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  images?: { url: string }[];
  total_tracks: number;
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SpotifyService {
  private readonly tokenKey = 'heartbeat_spotify_token';

  private trackSearchCache = new Map<string, SpotifyTrack[]>();
  private albumSearchCache = new Map<string, SpotifyAlbum[]>();

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));

    return Array.from(values, (value) => chars[value % chars.length]).join('');
  }

  private async createChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async login(): Promise<void> {
    const verifier = this.randomString(64);
    const challenge = await this.createChallenge(verifier);
    const state = this.randomString(32);

    sessionStorage.setItem('heartbeat_code_verifier', verifier);
    sessionStorage.setItem('heartbeat_oauth_state', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
      scope: 'playlist-modify-private',
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const savedState = sessionStorage.getItem('heartbeat_oauth_state');
    const verifier = sessionStorage.getItem('heartbeat_code_verifier');

    if (!savedState || state !== savedState || !verifier) {
      throw new Error('Spotify login verification failed. Please try again.');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Could not connect to Spotify.');
    }

    sessionStorage.setItem(this.tokenKey, data.access_token);
    sessionStorage.setItem(
      'heartbeat_spotify_token_expiry',
      String(Date.now() + data.expires_in * 1000),
    );

    sessionStorage.removeItem('heartbeat_code_verifier');
    sessionStorage.removeItem('heartbeat_oauth_state');
  }

  // async searchTracks(query: string): Promise<SpotifyTrack[]> {
  //   const token = this.getValidToken();
  //   const cacheKey = query.trim().toLowerCase();

  //   if (this.trackSearchCache.has(cacheKey)) {
  //     return this.trackSearchCache.get(cacheKey)!;
  //   }
  //   if (!token) {
  //     throw new Error('Connect to Spotify first.');
  //   }

  //   const params = new URLSearchParams({
  //     q: query,
  //     type: 'track',
  //     limit: '10',
  //   });

  //   const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });

  //   const data = await response.json();

  //   if (!response.ok) {
  //     throw new Error(data.error?.message || 'Spotify track search failed.');
  //   }
  //   const tracks = (data.tracks?.items ?? []) as SpotifyTrack[];
  //   this.trackSearchCache.set(cacheKey, tracks);
  //   return tracks;
  // }

  //   get album search function

  // async getAlbumTracks(albumId: string, albumName: string): Promise<SpotifyTrack[]> {
  //   const token = this.getValidToken();

  //   if (!token) {
  //     throw new Error('Connect to Spotify first.');
  //   }

  //   const response = await fetch(
  //     `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}/tracks?limit=50`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     },
  //   );

  //   const data = await response.json();

  //   if (!response.ok) {
  //     throw new Error(data.error?.message || 'Could not load Spotify album tracks.');
  //   }

  //   return (data.items ?? []).map((track: any) => ({
  //     ...track,
  //     album: { name: albumName },
  //   })) as SpotifyTrack[];
  // }

  async searchTracks(query: string, offset = 0): Promise<SpotifyTrack[]> {
    const token = this.getValidToken();
    const cacheKey = `${query.trim().toLowerCase()}|${offset}`;

    if (this.trackSearchCache.has(cacheKey)) {
      return this.trackSearchCache.get(cacheKey)!;
    }

    if (!token) {
      throw new Error('Connect to Spotify first.');
    }

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '10',
      offset: String(offset),
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Spotify track search failed.');
    }

    const tracks = (data.tracks?.items ?? []) as SpotifyTrack[];
    this.trackSearchCache.set(cacheKey, tracks);

    return tracks;
  }

  async getAlbumTracks(albumId: string, albumName: string): Promise<SpotifyTrack[]> {
    const token = this.getValidToken();

    if (!token) {
      throw new Error('Connect to Spotify first.');
    }

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Could not load Spotify album tracks.');
    }

    return (data.items ?? []).map((track: any) => ({
      ...track,
      album: {
        name: albumName,
        images: [],
      },
    })) as SpotifyTrack[];
  }

  async searchAlbums(query: string): Promise<SpotifyAlbum[]> {
    const token = this.getValidToken();
    const cacheKey = query.trim().toLowerCase();

    if (this.albumSearchCache.has(cacheKey)) {
      return this.albumSearchCache.get(cacheKey)!;
    }

    if (!token) {
      throw new Error('Connect to Spotify first.');
    }

    const params = new URLSearchParams({
      q: query,
      type: 'album',
      limit: '10',
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Spotify album search failed.');
    }

    const albums = (data.albums?.items ?? []) as SpotifyAlbum[];
    this.albumSearchCache.set(cacheKey, albums);
    return albums;
  }

  async createPlaylist(
    name: string,
    description = 'Created with HEARTBEAT 💜',
  ): Promise<SpotifyPlaylist> {
    const token = this.getValidToken();

    if (!token) {
      throw new Error('Connect to Spotify again before creating a playlist.');
    }

    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    });

    // const data = await response.json();

    // if (!response.ok) {
    //   throw new Error(data.error?.message || 'Could not create the Spotify playlist.');
    // }

    // return data as SpotifyPlaylist;

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify playlist creation failed:', {
        status: response.status,
        response: data,
      });

      throw new Error(data.error?.message || `Spotify rejected the request (${response.status}).`);
    }

    return data as SpotifyPlaylist;
  }

  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    const token = this.getValidToken();

    if (!token) {
      throw new Error('Connect to Spotify again before adding tracks.');
    }

    const uris = trackIds.filter((id) => Boolean(id)).map((id) => `spotify:track:${id}`);

    if (uris.length === 0) {
      throw new Error('No valid Spotify tracks were found to add.');
    }

    // Spotify accepts up to 100 items per request.
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100);

      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/items`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: batch }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error?.message || 'The playlist was created, but some tracks could not be added.',
        );
      }
    }
  }

  private getValidToken(): string | null {
    const token = sessionStorage.getItem(this.tokenKey);
    const expiry = Number(sessionStorage.getItem('heartbeat_spotify_token_expiry'));

    if (!token || !expiry || Date.now() >= expiry) {
      return null;
    }

    return token;
  }

  isConnected(): boolean {
    return this.getValidToken() !== null;
  }
}
