// // ng serve -o --host 127.0.0.1 --port 4200

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
// import {  Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SpotifyService,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
} from '../services/spotify.service';

@Component({
  selector: 'app-playlist-creator',
  imports: [FormsModule],
  templateUrl: './playlist-creator.html',
  styleUrl: './playlist-creator.scss',
})
export class PlaylistCreator implements OnInit {
  private spotifyService = inject(SpotifyService);

  // constructor(private cdRef: ChangeDetectorRef) {
  //   this.checkSpotifyConnection();
  // }

  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    this.checkSpotifyConnection();
  }

  // Spotify playlist creation
  isCreatingSpotifyPlaylist = false;
  createdSpotifyPlaylist: SpotifyPlaylist | null = null;
  spotifyPlaylistError = '';

  // Generation and preview
  hasAttemptedGeneration = false;
  isGenerating = false;
  generatedPlaylistSequence: string[] = [];
  generatedFocusSequence: string[] = [];

  // Focus-track configuration
  focusSong1 = '';
  focusSong2 = '';
  focusCount1 = 10;
  focusCount2 = 9;

  selectedSpotifyTrack1: SpotifyTrack | null = null;
  selectedSpotifyTrack2: SpotifyTrack | null = null;

  // Album configuration
  album1 = '';
  album2 = '';

  selectedSpotifyAlbum1: SpotifyAlbum | null = null;
  selectedSpotifyAlbum2: SpotifyAlbum | null = null;

  // Playlist rules
  openingBuffers = 2;
  closingBuffers = 2;
  lowStreamTracks = 2;
  fillerCount = 3;
  nonBtsTracks = 2;
  confirmBufferRules = true;
  fillerDuration1 = 4.5;
  fillerDuration2 = 4.5;

  // Spotify connection
  spotifyConnected = false;

  connectSpotify(): void {
    this.spotifyService.login();
  }

  checkSpotifyConnection(): void {
    this.spotifyConnected = this.spotifyService.isConnected();
    this.cdr.markForCheck();
  }

  // Track search, shown inside the Focus Tracks section
  spotifyTrackQuery = '';
  spotifyTracks: SpotifyTrack[] = [];
  trackSearchLoading = false;

  // Album search, shown inside the Album Selection section
  spotifyAlbumQuery = '';
  spotifyAlbums: SpotifyAlbum[] = [];
  albumSearchLoading = false;

  spotifySearchError = '';

  async searchSpotifyTracks(): Promise<void> {
    const query = this.spotifyTrackQuery.trim();

    if (!this.spotifyConnected) {
      this.spotifySearchError = 'Connect Spotify before searching.';
      return;
    }

    if (!query) {
      this.spotifyTracks = [];
      this.spotifySearchError = 'Enter a song title to search.';
      return;
    }

    this.trackSearchLoading = true;
    this.spotifySearchError = '';
    this.spotifyTracks = [];

    try {
      this.spotifyTracks = await this.spotifyService.searchTracks(query);

      if (this.spotifyTracks.length === 0) {
        this.spotifySearchError = 'No tracks found. Try another search.';
      }
    } catch (error) {
      this.spotifySearchError =
        error instanceof Error ? error.message : 'Spotify track search failed.';
    } finally {
      this.trackSearchLoading = false;
    }
  }

  async searchSpotifyAlbums(): Promise<void> {
    const query = this.spotifyAlbumQuery.trim();

    if (!this.spotifyConnected) {
      this.spotifySearchError = 'Connect Spotify before searching.';
      return;
    }

    if (!query) {
      this.spotifyAlbums = [];
      this.spotifySearchError = 'Enter an album title to search.';
      return;
    }

    this.albumSearchLoading = true;
    this.spotifySearchError = '';
    this.spotifyAlbums = [];

    try {
      this.spotifyAlbums = await this.spotifyService.searchAlbums(query);

      if (this.spotifyAlbums.length === 0) {
        this.spotifySearchError = 'No albums found. Try another search.';
      }
    } catch (error) {
      this.spotifySearchError =
        error instanceof Error ? error.message : 'Spotify album search failed.';
    } finally {
      this.albumSearchLoading = false;
    }
  }

  chooseSpotifyTrack(track: SpotifyTrack, slot: 1 | 2): void {
    if (slot === 1) {
      this.selectedSpotifyTrack1 = track;
      this.focusSong1 = track.name;
    } else {
      this.selectedSpotifyTrack2 = track;
      this.focusSong2 = track.name;
    }

    this.spotifyTrackQuery = '';
    this.spotifyTracks = [];
    this.spotifySearchError = '';
  }

  chooseSpotifyAlbum(album: SpotifyAlbum, slot: 1 | 2): void {
    if (slot === 1) {
      this.selectedSpotifyAlbum1 = album;
      this.album1 = album.name;
    } else {
      this.selectedSpotifyAlbum2 = album;
      this.album2 = album.name;
    }

    this.spotifyAlbumQuery = '';
    this.spotifyAlbums = [];
    this.spotifySearchError = '';
  }

  selectAlbum2(album: string): void {
    this.album2 = album;

    if (!album.trim()) {
      this.selectedSpotifyAlbum2 = null;
    }

    this.spotifyAlbums = [];
    this.spotifyAlbumQuery = '';
    this.spotifySearchError = '';
  }

  formatArtists(artists: { name: string }[]): string {
    return artists.map((artist) => artist.name).join(', ');
  }

  get validationErrors(): string[] {
    const errors: string[] = [];
    const hasSong1 = this.focusSong1.trim().length > 0;
    const hasSong2 = this.focusSong2.trim().length > 0;
    const focusCount = Number(hasSong1) + Number(hasSong2);

    if (this.hasAttemptedGeneration && !hasSong1 && !hasSong2) {
      errors.push('Choose at least one focus song.');
    }

    if (
      hasSong1 &&
      hasSong2 &&
      this.focusSong1.trim().toLowerCase() === this.focusSong2.trim().toLowerCase()
    ) {
      errors.push('Choose two different focus songs.');
    }

    if (hasSong1) {
      const max = focusCount === 1 ? 12 : 10;

      if (
        !Number.isInteger(Number(this.focusCount1)) ||
        this.focusCount1 < 1 ||
        this.focusCount1 > max
      ) {
        errors.push(`Focus Song 1 must have 1–${max} plays.`);
      }
    }

    if (hasSong2) {
      if (
        !Number.isInteger(Number(this.focusCount2)) ||
        this.focusCount2 < 1 ||
        this.focusCount2 > 10
      ) {
        errors.push('Focus Song 2 must have 1–10 plays.');
      }
    }

    if (this.album2.trim() && !this.album1.trim()) {
      errors.push('Enter Album 1 before selecting Album 2.');
    }

    if (focusCount === 2 && this.album2.trim()) {
      errors.push('Two focus songs can be combined with at most one album.');
    }

    if (this.openingBuffers !== 2) {
      errors.push('You must have exactly 2 opening buffer tracks.');
    }

    if (this.closingBuffers !== 2) {
      errors.push('You must have exactly 2 closing buffer tracks.');
    }

    if (!this.confirmBufferRules) {
      errors.push('Confirm that all four buffer tracks are non-focus and non-charting.');
    }

    if (this.lowStreamTracks !== 2) {
      errors.push('Every playlist must contain exactly 2 low-stream tracks.');
    }

    if (this.fillerCount < 2 || this.fillerCount > 5) {
      errors.push('Use 3–4 fillers normally; 5 is the rare maximum.');
    }

    if (this.fillerCount === 2) {
      const total = this.fillerDuration1 + this.fillerDuration2;

      if (this.fillerDuration1 <= 4 || this.fillerDuration2 <= 4 || total < 8 || total > 10) {
        errors.push(
          'The 2-filler exception requires both tracks to exceed 4 minutes and total 8–10 minutes.',
        );
      }
    }

    if (this.nonBtsTracks < 2 || this.nonBtsTracks > 3) {
      errors.push('Use only 2–3 non-BTS/local tracks.');
    }

    return errors;
  }

  get validationWarnings(): string[] {
    return this.fillerCount === 5 ? ['Five fillers should be used only rarely.'] : [];
  }

  // async generatePlaylist(): Promise<void> {
  //   console.log('[HEARTBEAT] Generate clicked');
  //   if (this.isGenerating) return;

  //   this.hasAttemptedGeneration = true;
  //   this.spotifySearchError = '';

  //   if (this.validationErrors.length > 0) return;

  //   this.isGenerating = true;

  //   try {
  //     // Build the requested focus-song play counts.
  //     const focusCounts = new Map<string, { name: string; remaining: number; total: number }>();

  //     const addFocusSong = (name: string, count: number): void => {
  //       const cleanName = name.trim();

  //       if (!cleanName || !Number.isInteger(count) || count <= 0) return;

  //       const key = cleanName.toLowerCase();
  //       const existing = focusCounts.get(key);

  //       if (existing) {
  //         existing.remaining += count;
  //         existing.total += count;
  //       } else {
  //         focusCounts.set(key, {
  //           name: cleanName,
  //           remaining: count,
  //           total: count,
  //         });
  //       }
  //     };

  //     addFocusSong(this.focusSong1, Number(this.focusCount1));
  //     addFocusSong(this.focusSong2, Number(this.focusCount2));

  //     const focusTotal = [...focusCounts.values()].reduce((sum, track) => sum + track.total, 0);

  //     console.log('[HEARTBEAT] Loading album tracks...');
  //     // Load every track from the selected albums.
  //     const albumTracks: string[] = [];
  //     const selectedAlbumIds = new Set<string>();

  //     const albumsToLoad = [
  //       { album: this.selectedSpotifyAlbum1, title: this.album1 },
  //       { album: this.selectedSpotifyAlbum2, title: this.album2 },
  //     ];

  //     for (const selection of albumsToLoad) {
  //       const title = selection.title.trim();
  //       const album = selection.album;

  //       if (!title) continue;

  //       if (!album || album.name.trim().toLowerCase() !== title.toLowerCase()) {
  //         throw new Error(`Please select "${title}" again from the Spotify search results.`);
  //       }

  //       if (selectedAlbumIds.has(album.id)) continue;
  //       selectedAlbumIds.add(album.id);

  //       const tracks = await this.spotifyService.getAlbumTracks(album.id, album.name);

  //       albumTracks.push(...tracks.map((track) => track.name));
  //     }

  //     type PlaylistItem = {
  //       name: string;
  //       kind: 'focus' | 'album';
  //     };

  //     const totalItems = focusTotal + albumTracks.length;

  //     if (totalItems === 0) {
  //       throw new Error('Choose at least one focus song or album.');
  //     }

  //     // Try several arrangements to distribute focus plays naturally.
  //     const candidates: { tracks: PlaylistItem[]; score: number }[] = [];

  //     for (let attempt = 0; attempt < 80; attempt++) {
  //       const remaining = new Map(
  //         [...focusCounts.entries()].map(([key, value]) => [key, { ...value }]),
  //       );

  //       const tracks: PlaylistItem[] = [];
  //       let albumIndex = 0;
  //       let focusAdded = 0;
  //       let focusRun = 0;
  //       let albumRun = 0;
  //       let previousFocus = '';

  //       while (focusAdded < focusTotal || albumIndex < albumTracks.length) {
  //         const albumsLeft = albumTracks.length - albumIndex;
  //         const focusLeft = focusTotal - focusAdded;
  //         let chooseFocus = false;

  //         if (albumsLeft === 0) {
  //           chooseFocus = true;
  //         } else if (focusLeft === 0) {
  //           chooseFocus = false;
  //         } else if (focusRun >= 2) {
  //           chooseFocus = false;
  //         } else if (albumRun >= 2) {
  //           chooseFocus = true;
  //         } else {
  //           const targetFocusSoFar = ((tracks.length + 1) * focusTotal) / totalItems;
  //           const deficit = targetFocusSoFar - focusAdded;
  //           const probability = Math.max(0.15, Math.min(0.85, 0.5 + deficit * 0.25));

  //           chooseFocus = Math.random() < probability;
  //         }

  //         if (chooseFocus) {
  //           let available = [...remaining.entries()].filter(([, track]) => track.remaining > 0);

  //           if (available.length === 0) break;

  //           const alternatives = available.filter(([key]) => key !== previousFocus);

  //           if (alternatives.length > 0) available = alternatives;

  //           const highestRemaining = Math.max(...available.map(([, track]) => track.remaining));

  //           const tied = available.filter(([, track]) => track.remaining === highestRemaining);

  //           const [key, selected] = tied[Math.floor(Math.random() * tied.length)];

  //           tracks.push({ name: selected.name, kind: 'focus' });
  //           selected.remaining--;
  //           focusAdded++;
  //           focusRun++;
  //           albumRun = 0;
  //           previousFocus = key;
  //         } else {
  //           tracks.push({
  //             name: albumTracks[albumIndex],
  //             kind: 'album',
  //           });

  //           albumIndex++;
  //           albumRun++;
  //           focusRun = 0;
  //           previousFocus = '';
  //         }
  //       }

  //       let score = 0;
  //       const positions = new Map<string, number[]>();

  //       tracks.forEach((track, index) => {
  //         if (track.kind !== 'focus') return;

  //         const key = track.name.toLowerCase();
  //         const songPositions = positions.get(key) ?? [];
  //         songPositions.push(index);
  //         positions.set(key, songPositions);

  //         const previous = tracks[index - 1];
  //         if (previous?.kind === 'focus' && previous.name.toLowerCase() === key) {
  //           score += 100;
  //         }

  //         const previousTwo = tracks[index - 2];
  //         if (previousTwo?.kind === 'focus' && previousTwo.name.toLowerCase() === key) {
  //           score += 8;
  //         }
  //       });

  //       for (const [key, songPositions] of positions) {
  //         const requestedCount = focusCounts.get(key)!.total;
  //         const idealGap = totalItems / requestedCount;

  //         for (let i = 1; i < songPositions.length; i++) {
  //           const actualGap = songPositions[i] - songPositions[i - 1];
  //           score += Math.abs(actualGap - idealGap);
  //         }
  //       }

  //       candidates.push({ tracks, score });
  //     }

  //     candidates.sort((a, b) => a.score - b.score);
  //     const shortlist = candidates.slice(0, Math.min(5, candidates.length));

  //     const chosen = shortlist[Math.floor(Math.random() * shortlist.length)];

  //     if (!chosen) {
  //       throw new Error('Could not arrange the selected tracks. Try again.');
  //     }

  //     const mainTracks = chosen.tracks.map((track) => track.name);
  //     const excludedNames = new Set<string>();

  //     for (const name of [this.focusSong1, this.focusSong2, ...albumTracks]) {
  //       if (name.trim()) excludedNames.add(name.trim().toLowerCase());
  //     }

  //     const fillerTotal = Number(this.fillerCount);
  //     console.log('[HEARTBEAT] Searching for supporting tracks...');
  //     const supportTracks = await this.loadSupportTracks(excludedNames, 4 + fillerTotal);
  //     console.log('[HEARTBEAT] Supporting tracks loaded');

  //     const openingBuffers = supportTracks.slice(0, 2);
  //     const fillerTracks = supportTracks.slice(2, 2 + fillerTotal);
  //     const closingBuffers = supportTracks.slice(-2);

  //     const tracksWithFillers: string[] = [];
  //     let nextFiller = 0;

  //     for (let i = 0; i < mainTracks.length; i++) {
  //       tracksWithFillers.push(mainTracks[i]);

  //       const targetPosition = Math.floor(
  //         ((nextFiller + 1) * mainTracks.length) / (fillerTracks.length + 1),
  //       );

  //       if (nextFiller < fillerTracks.length && i + 1 >= targetPosition) {
  //         tracksWithFillers.push(fillerTracks[nextFiller].name);
  //         nextFiller++;
  //       }
  //     }

  //     while (nextFiller < fillerTracks.length) {
  //       tracksWithFillers.push(fillerTracks[nextFiller].name);
  //       nextFiller++;
  //     }

  //     // Keep the generated preview, then clear the configuration.
  //     this.generatedPlaylistSequence = [
  //       ...openingBuffers.map((track) => track.name),
  //       ...tracksWithFillers,
  //       ...closingBuffers.map((track) => track.name),
  //     ];

  //     this.resetConfiguration();
  //   } catch (error) {
  //     this.spotifySearchError =
  //       error instanceof Error
  //         ? error.message
  //         : 'Something went wrong while generating your playlist.';
  //   } finally {
  //     console.log('[HEARTBEAT] Finally block reached');

  //     this.isGenerating = false;

  //     console.log('[HEARTBEAT] isGenerating:', this.isGenerating);

  //     this.cdr.markForCheck();
  //   }
  // }

  //   async generatePlaylist(): Promise<void> {
  //     if (this.isGenerating) return;

  //     this.hasAttemptedGeneration = true;
  //     this.spotifySearchError = '';

  //     if (this.validationErrors.length > 0) return;

  //     this.isGenerating = true;
  //     this.cdr.markForCheck();

  //     try {
  //       // 1. Build the exact requested focus-song sequence.
  //       const focusPool: string[] = [];

  //       const addFocus = (name: string, count: number): void => {
  //         const cleanName = name.trim();

  //         for (let i = 0; i < count; i++) {
  //           if (cleanName) focusPool.push(cleanName);
  //         }
  //       };

  //       addFocus(this.focusSong1, Number(this.focusCount1));
  //       addFocus(this.focusSong2, Number(this.focusCount2));

  //       if (focusPool.length === 0) {
  //         throw new Error('Choose at least one focus song.');
  //       }

  //       // Shuffle while avoiding the same focus song twice consecutively.
  //       const focusSequence: string[] = [];
  //       const remaining = new Map<string, number>();

  //       for (const name of focusPool) {
  //         const key = this.normalizeTrackName(name);
  //         remaining.set(key, (remaining.get(key) ?? 0) + 1);
  //       }

  //       while ([...remaining.values()].some((count) => count > 0)) {
  //         const previous = focusSequence.length
  //           ? this.normalizeTrackName(focusSequence[focusSequence.length - 1])
  //           : '';

  //         let available = [...remaining.entries()].filter(([, count]) => count > 0);

  //         const alternatives = available.filter(([key]) => key !== previous);

  //         if (alternatives.length > 0) {
  //           available = alternatives;
  //         }

  //         const totalRemaining = available.reduce((sum, [, count]) => sum + count, 0);

  //         let pick = Math.floor(Math.random() * totalRemaining);

  //         for (const [key, count] of available) {
  //           pick -= count;

  //           if (pick < 0) {
  //             focusSequence.push(
  //               key === this.normalizeTrackName(this.focusSong1)
  //                 ? this.focusSong1.trim()
  //                 : key === this.normalizeTrackName(this.focusSong2)
  //                   ? this.focusSong2.trim()
  //                   : key,
  //             );

  //             remaining.set(key, count - 1);
  //             break;
  //           }
  //         }
  //       }

  //       // 2. Load the actual tracks from selected Spotify albums.
  //       const albumTracks: SpotifyTrack[] = [];
  //       const seenAlbumTrackIds = new Set<string>();
  //       const selectedAlbumIds = new Set<string>();

  //       const albumSelections = [
  //         { title: this.album1, album: this.selectedSpotifyAlbum1 },
  //         { title: this.album2, album: this.selectedSpotifyAlbum2 },
  //       ];

  //       for (const selection of albumSelections) {
  //         const title = selection.title.trim();
  //         if (!title) continue;

  //         const album = selection.album;

  //         if (!album || album.name.trim().toLowerCase() !== title.toLowerCase()) {
  //           throw new Error(`Please select "${title}" again from the Spotify search results.`);
  //         }

  //         if (selectedAlbumIds.has(album.id)) continue;
  //         selectedAlbumIds.add(album.id);

  //         const tracks = await this.spotifyService.getAlbumTracks(album.id, album.name);

  //         for (const track of tracks) {
  //           const key = this.normalizeTrackName(track.name);
  //           const isFocusTrack = focusPool.some((name) => this.normalizeTrackName(name) === key);

  //           if (isFocusTrack || seenAlbumTrackIds.has(track.id)) continue;

  //           seenAlbumTrackIds.add(track.id);
  //           albumTracks.push(track);
  //         }
  //       }

  //       // 3. Create a variable-length gap after each focus placement.
  //       const gapCount = Math.max(0, focusSequence.length - 1);
  //       const albumGaps: SpotifyTrack[][] = Array.from({ length: gapCount }, () => []);

  //       // Distribute album tracks across gaps instead of grouping them together.
  //       const shuffledAlbums = [...albumTracks];

  //       for (let i = shuffledAlbums.length - 1; i > 0; i--) {
  //         const j = Math.floor(Math.random() * (i + 1));
  //         [shuffledAlbums[i], shuffledAlbums[j]] = [shuffledAlbums[j], shuffledAlbums[i]];
  //       }

  //       shuffledAlbums.forEach((track, index) => {
  //         if (gapCount > 0) {
  //           // Spread album tracks across the available gaps.
  //           const gapIndex = index % gapCount;
  //           albumGaps[gapIndex].push(track);
  //         }
  //       });

  //       // Usually target 3–4 supporting tracks per gap.
  //       // Occasionally use 5. Album tracks count toward the gap size.
  //       const gapTargets = Array.from({ length: gapCount }, () => {
  //         const roll = Math.random();

  //         if (roll < 0.05) return 5;
  //         return roll < 0.55 ? 3 : 4;
  //       });

  //       const extraFillersNeeded = albumGaps.reduce(
  //         (total, tracks, index) => total + Math.max(0, gapTargets[index] - tracks.length),
  //         0,
  //       );

  //       // Four separate buffer tracks, plus the additional gap fillers.
  //       const requiredSupportCount = 4 + extraFillersNeeded;

  //       const excludedNames = new Set<string>();

  //       for (const name of focusPool) {
  //         excludedNames.add(this.normalizeTrackName(name));
  //       }

  //       for (const track of albumTracks) {
  //         excludedNames.add(this.normalizeTrackName(track.name));
  //       }

  //       console.log('[HEARTBEAT] Loading BTS fillers and buffers...');

  //       const supportTracks = await this.loadSupportTracks(excludedNames, requiredSupportCount);

  //       // 4. Keep buffers separate from all gap fillers.
  //       // const openingBuffers = supportTracks.slice(0, 2);
  //       // const gapFillers = supportTracks.slice(2, 2 + extraFillersNeeded);
  //       // const closingBuffers = supportTracks.slice(2 + extraFillersNeeded, 4 + extraFillersNeeded);

  //       // if (
  //       //   openingBuffers.length !== 2 ||
  //       //   closingBuffers.length !== 2 ||
  //       //   gapFillers.length !== extraFillersNeeded
  //       // ) {
  //       //   throw new Error('Not enough eligible supporting tracks. Please try again.');
  //       // }

  //       // 4. Reserve two opening and two closing buffers first.
  // if (supportTracks.length < 4) {
  //   throw new Error(
  //     'Not enough eligible tracks for the four opening and closing buffers.',
  //   );
  // }

  // const openingBuffers = supportTracks.slice(0, 2);
  // const closingBuffers = supportTracks.slice(-2);

  // // Everything left over can be used between focus-song placements.
  // const gapFillers = supportTracks.slice(2, -2);

  //       // 5. Build the final sequence.
  //       const mainTracks: string[] = [];

  //       for (let i = 0; i < focusSequence.length; i++) {
  //         mainTracks.push(focusSequence[i]);

  //         if (i >= gapCount) continue;

  //         const gapTracks = [...albumGaps[i]];
  //         const target = gapTargets[i];

  //         while (gapTracks.length < target && gapFillers.length > 0) {
  //           gapTracks.push(gapFillers.shift()!);
  //         }

  //         // Shuffle each gap independently for a less predictable arrangement.
  //         for (let j = gapTracks.length - 1; j > 0; j--) {
  //           const k = Math.floor(Math.random() * (j + 1));
  //           [gapTracks[j], gapTracks[k]] = [gapTracks[k], gapTracks[j]];
  //         }

  //         mainTracks.push(...gapTracks.map((track) => track.name));
  //       }

  //       // If there is no gap, keep any selected album tracks in the main section.
  //       if (gapCount === 0 && albumTracks.length > 0) {
  //         mainTracks.push(...albumTracks.map((track) => track.name));
  //       }

  //       this.generatedPlaylistSequence = [
  //         ...openingBuffers.map((track) => track.name),
  //         ...mainTracks,
  //         ...closingBuffers.map((track) => track.name),
  //       ];

  //       console.log(
  //         '[HEARTBEAT] Playlist generated:',
  //         this.generatedPlaylistSequence.length,
  //         'tracks',
  //       );

  //       this.resetConfiguration();
  //     } catch (error) {
  //       this.spotifySearchError =
  //         error instanceof Error
  //           ? error.message
  //           : 'Something went wrong while generating your playlist.';
  //     } finally {
  //       this.isGenerating = false;
  //       this.cdr.markForCheck();
  //     }
  //   }

  async generatePlaylist(): Promise<void> {
    if (this.isGenerating) return;

    this.hasAttemptedGeneration = true;
    this.spotifySearchError = '';

    if (this.validationErrors.length > 0) return;

    this.isGenerating = true;
    this.cdr.markForCheck();

    try {
      const normalize = (name: string) => this.normalizeTrackName(name);

      const shuffle = <T>(items: T[]): T[] => {
        const result = [...items];

        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
      };

      type FocusItem = { name: string; key: string };

      const focusItems: FocusItem[] = [];

      const addFocus = (name: string, count: number): void => {
        const cleanName = name.trim();

        if (!cleanName) return;

        for (let i = 0; i < Number(count); i++) {
          focusItems.push({
            name: cleanName,
            key: normalize(cleanName),
          });
        }
      };

      addFocus(this.focusSong1, Number(this.focusCount1));
      addFocus(this.focusSong2, Number(this.focusCount2));

      if (focusItems.length === 0) {
        throw new Error('Choose at least one focus song.');
      }

      const focusCounts = new Map<string, number>();

      for (const item of focusItems) {
        focusCounts.set(item.key, (focusCounts.get(item.key) ?? 0) + 1);
      }

      const hasTwoFocusSongs = Boolean(this.focusSong1.trim()) && Boolean(this.focusSong2.trim());

      if (hasTwoFocusSongs && normalize(this.focusSong1) === normalize(this.focusSong2)) {
        throw new Error('Choose two different focus songs.');
      }

      // Arrange focus plays while avoiding consecutive identical focus songs
      // whenever another focus song is available.
      const remaining = new Map<string, FocusItem[]>();

      for (const item of shuffle(focusItems)) {
        const list = remaining.get(item.key) ?? [];
        list.push(item);
        remaining.set(item.key, list);
      }

      const focusSequence: FocusItem[] = [];
      let previousKey = '';

      while ([...remaining.values()].some((list) => list.length > 0)) {
        let available = [...remaining.entries()]
          .filter(([, list]) => list.length > 0)
          .map(([key, list]) => ({
            key,
            item: list[0],
            count: list.length,
          }));

        const alternatives = available.filter((option) => option.key !== previousKey);

        if (alternatives.length > 0) {
          available = alternatives;
        }

        const highest = Math.max(...available.map((option) => option.count));

        const choices = shuffle(available.filter((option) => option.count === highest));

        const chosen = choices[0];

        focusSequence.push(chosen.item);
        remaining.get(chosen.key)!.shift();
        previousKey = chosen.key;
      }

      // Fetch every distinct Spotify track from the selected albums.
      // Different Spotify IDs are preserved, including clean/explicit versions.
      const albumTracks: SpotifyTrack[] = [];
      const seenAlbumIds = new Set<string>();
      const seenAlbumTrackIds = new Set<string>();

      const selections = [
        { title: this.album1, album: this.selectedSpotifyAlbum1 },
        { title: this.album2, album: this.selectedSpotifyAlbum2 },
      ];

      for (const selection of selections) {
        const title = selection.title?.trim();

        if (!title || title.toLowerCase() === 'none') continue;

        const album = selection.album;

        if (!album) {
          throw new Error(
            `Please select the Spotify album for "${title}" from the search results.`,
          );
        }

        if (seenAlbumIds.has(album.id)) continue;
        seenAlbumIds.add(album.id);

        const tracks = await this.spotifyService.getAlbumTracks(album.id, 'US');

        for (const track of tracks) {
          if (!track.id || seenAlbumTrackIds.has(track.id)) continue;

          seenAlbumTrackIds.add(track.id);
          albumTracks.push(track);
        }
      }

      // Exclude focus and album titles from ordinary support tracks.
      const excludedNames = new Set<string>([
        ...focusCounts.keys(),
        ...albumTracks.map((track) => normalize(track.name)),
      ]);

      const supportTracks = await this.loadSupportTracks(excludedNames, 100);

      const bufferCandidates = shuffle(
        supportTracks.filter((track) => !this.isProtectedBufferTrack(track.name)),
      );

      if (bufferCandidates.length < 4) {
        throw new Error('Not enough eligible tracks for the two opening and two closing buffers.');
      }

      // Reserve four distinct buffers first.
      const openingBuffers = bufferCandidates.slice(0, 2);
      const closingBuffers = bufferCandidates.slice(2, 4);

      const bufferIds = new Set([
        ...openingBuffers.map((track) => track.id),
        ...closingBuffers.map((track) => track.id),
      ]);

      const fillerPool = shuffle(supportTracks.filter((track) => !bufferIds.has(track.id)));

      // Determine how many tracks can fit between focus placements.
      // With two alternating focus songs, the other focus song also counts
      // as an intervening track. Avoid consecutive two-track gaps.
      const gapCount = Math.max(0, focusSequence.length - 1);
      const gapTargets: number[] = [];

      for (let i = 0; i < gapCount; i++) {
        const sameAsNext = focusSequence[i].key === focusSequence[i + 1].key;

        if (!hasTwoFocusSongs || sameAsNext) {
          gapTargets.push(3 + Math.floor(Math.random() * 2));
        } else {
          let target = 1 + Math.floor(Math.random() * 2);

          if (i > 0 && gapTargets[i - 1] === 2) {
            target = 1;
          }

          gapTargets.push(target);
        }
      }

      const gaps: SpotifyTrack[][] = Array.from({ length: gapCount }, () => []);

      const albumCapacity = gapTargets.reduce((total, target) => total + target, 0);

      // A single focus play has no between-focus gaps, so albums are placed
      // separately below. Otherwise, preserve every album track.
      if (gapCount > 0 && albumTracks.length > albumCapacity) {
        throw new Error(
          `All ${albumTracks.length} album tracks need to be included, ` +
            `but this arrangement has only ${albumCapacity} available slots. ` +
            'Try a configuration with more focus plays.',
        );
      }

      // Spread album tracks across different gaps instead of grouping them.
      const gapOrder = shuffle(Array.from({ length: gapCount }, (_, index) => index));

      for (const track of shuffle(albumTracks)) {
        if (gapCount === 0) break;

        const availableGap = gapOrder.find((index) => gaps[index].length < gapTargets[index]);

        if (availableGap === undefined) {
          throw new Error('Could not place every selected album track.');
        }

        gaps[availableGap].push(track);
      }

      // Fill remaining gap slots with BTS-related supporting tracks.
      const requiredFillers = gaps.reduce(
        (total, gap, index) => total + gapTargets[index] - gap.length,
        0,
      );

      if (requiredFillers > 0 && fillerPool.length === 0) {
        throw new Error('Not enough supporting tracks to fill the playlist gaps.');
      }

      let fillerIndex = 0;

      for (let i = 0; i < gapCount; i++) {
        while (gaps[i].length < gapTargets[i]) {
          gaps[i].push(fillerPool[fillerIndex % fillerPool.length]);

          fillerIndex++;
        }

        gaps[i] = shuffle(gaps[i]);
      }

      // Assemble the main sequence.
      const mainTracks: string[] = [];

      for (let i = 0; i < focusSequence.length; i++) {
        mainTracks.push(focusSequence[i].name);

        if (i < gapCount) {
          mainTracks.push(...gaps[i].map((track) => track.name));
        }
      }

      // If there is only one focus play, there are no gaps to use.
      // Insert every selected album track around that focus play.
      if (gapCount === 0 && albumTracks.length > 0) {
        const shuffledAlbums = shuffle(albumTracks);
        const focusIndex = mainTracks.findIndex((name) => normalize(name) === focusSequence[0].key);

        const beforeCount = Math.floor(Math.random() * (shuffledAlbums.length + 1));

        mainTracks.splice(
          Math.max(0, focusIndex),
          0,
          ...shuffledAlbums.slice(0, beforeCount).map((track) => track.name),
        );

        mainTracks.splice(
          Math.max(0, focusIndex) + beforeCount + (focusIndex >= 0 ? 1 : 0),
          0,
          ...shuffledAlbums.slice(beforeCount).map((track) => track.name),
        );
      }

      // Select exactly two distinct non-BTS low-stream candidates.
      // Replace existing filler slots instead of adding tracks, so
      // focus-song spacing and total playlist length remain unchanged.
      const excludedLowStreamNames = new Set<string>([
        ...focusCounts.keys(),
        ...albumTracks.map((track) => normalize(track.name)),
        ...openingBuffers.map((track) => normalize(track.name)),
        ...closingBuffers.map((track) => normalize(track.name)),
      ]);

      const excludedLowStreamIds = new Set<string>([
        ...albumTracks.map((track) => track.id),
        ...openingBuffers.map((track) => track.id),
        ...closingBuffers.map((track) => track.id),
      ]);

      const lowStreamTracks = await this.loadLowStreamTracks(
        excludedLowStreamNames,
        excludedLowStreamIds,
      );

      // Replace two different non-focus filler slots in separate
      // sections of the main sequence; never replace album/focus tracks.
      const protectedMainNames = new Set<string>([
        ...focusCounts.keys(),
        ...albumTracks.map((track) => normalize(track.name)),
      ]);

      const replaceableIndices = mainTracks
        .map((name, index) => ({ name, index }))
        .filter(({ name }) => !protectedMainNames.has(normalize(name)))
        .map(({ index }) => index);

      if (replaceableIndices.length < 2) {
        throw new Error('Not enough non-focus filler slots for the two low-stream tracks.');
      }

      const firstTarget = Math.floor(mainTracks.length * 0.35);
      const secondTarget = Math.floor(mainTracks.length * 0.7);

      const pickNearest = (target: number, used: Set<number>): number | undefined =>
        replaceableIndices
          .filter((index) => !used.has(index))
          .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

      const chosenIndices = new Set<number>();

      const firstIndex = pickNearest(firstTarget, chosenIndices);

      if (firstIndex === undefined) {
        throw new Error('Could not place the first low-stream track.');
      }

      chosenIndices.add(firstIndex);

      const secondIndex = pickNearest(secondTarget, chosenIndices);

      if (secondIndex === undefined) {
        throw new Error('Could not place the second low-stream track.');
      }

      mainTracks[firstIndex] = lowStreamTracks[0].name;
      mainTracks[secondIndex] = lowStreamTracks[1].name;

      const finalSequence = [
        ...openingBuffers.map((track) => track.name),
        ...mainTracks,
        ...closingBuffers.map((track) => track.name),
      ];

      // Validate exact focus counts and spacing in the FINAL playlist.
      // Album versions with distinct Spotify IDs remain separate tracks.
      for (const [key, expected] of focusCounts) {
        const positions = finalSequence
          .map((name, index) => (normalize(name) === key ? index : -1))
          .filter((index) => index !== -1);

        if (positions.length !== expected) {
          throw new Error(
            `Expected ${expected} plays of "${key}", but generated ${positions.length}.`,
          );
        }

        for (let i = 1; i < positions.length; i++) {
          const interveningTracks = positions[i] - positions[i - 1] - 1;

          if (interveningTracks < 3 || interveningTracks > 4) {
            throw new Error(
              `Spacing check failed for "${finalSequence[positions[i]]}": ` +
                `${interveningTracks} tracks between plays. ` +
                'The arrangement needs to be adjusted.',
            );
          }
        }
      }

      // Keep the preview visible and clear configuration only on success.
      this.generatedPlaylistSequence = finalSequence;
      this.generatedFocusSequence = focusSequence.map((item) => item.name);

      console.log('Generated playlist:', finalSequence);
      console.log('Total tracks:', finalSequence.length);

      this.focusSong1 = '';
      this.focusSong2 = '';
      this.focusCount1 = 10;
      this.focusCount2 = 9;

      this.album1 = '';
      this.album2 = '';
      this.selectedSpotifyAlbum1 = null;
      this.selectedSpotifyAlbum2 = null;
      this.selectedSpotifyTrack1 = null;
      this.selectedSpotifyTrack2 = null;

      this.spotifyTrackQuery = '';
      this.spotifyAlbumQuery = '';
      this.spotifyTracks = [];
      this.spotifyAlbums = [];

      this.hasAttemptedGeneration = false;
    } catch (error) {
      this.spotifySearchError =
        error instanceof Error ? error.message : 'Unable to generate the playlist.';
    } finally {
      this.isGenerating = false;
      this.cdr.markForCheck();
    }
  }

  async createSpotifyPlaylist(): Promise<void> {
    if (this.isCreatingSpotifyPlaylist) return;

    if (!this.spotifyConnected) {
      this.spotifyPlaylistError = 'Connect to Spotify first.';
      return;
    }

    if (this.generatedPlaylistSequence.length === 0) {
      this.spotifyPlaylistError = 'Generate a playlist first.';
      return;
    }

    this.isCreatingSpotifyPlaylist = true;
    this.spotifyPlaylistError = '';
    this.createdSpotifyPlaylist = null;
    this.cdr.markForCheck();

    try {
      const trackCache = new Map<string, SpotifyTrack>();

      // Resolve each preview title to a Spotify track.
      for (const title of this.generatedPlaylistSequence) {
        const key = this.normalizeTrackName(title);

        if (trackCache.has(key)) continue;

        const results = await this.spotifyService.searchTracks(title);

        const exactMatch = results.find((track) => this.normalizeTrackName(track.name) === key);

        if (!exactMatch) {
          throw new Error(`Could not find an exact Spotify match for "${title}".`);
        }

        trackCache.set(key, exactMatch);
      }

      // Preserve playlist order and repeated plays.
      const trackIds = this.generatedPlaylistSequence.map(
        (title) => trackCache.get(this.normalizeTrackName(title))!.id,
      );

      const playlist = await this.spotifyService.createPlaylist(
        `HEARTBEAT 💜 ${new Date().toLocaleDateString()}`,
        'A BTS-focused playlist generated with HEARTBEAT.',
      );

      this.createdSpotifyPlaylist = playlist;

      await this.spotifyService.addTracksToPlaylist(playlist.id, trackIds);
    } catch (error) {
      this.spotifyPlaylistError =
        error instanceof Error ? error.message : 'Could not create your Spotify playlist.';
    } finally {
      this.isCreatingSpotifyPlaylist = false;
      this.cdr.markForCheck();
    }
  }

  private normalizeTrackName(name: string): string {
    return name.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }

  private resetConfiguration(): void {
    this.focusSong1 = '';
    this.focusSong2 = '';
    this.focusCount1 = 10;
    this.focusCount2 = 9;

    this.selectedSpotifyTrack1 = null;
    this.selectedSpotifyTrack2 = null;

    this.album1 = '';
    this.album2 = '';
    this.selectedSpotifyAlbum1 = null;
    this.selectedSpotifyAlbum2 = null;

    this.spotifyTrackQuery = '';
    this.spotifyAlbumQuery = '';
    this.spotifyTracks = [];
    this.spotifyAlbums = [];

    this.spotifySearchError = '';
    this.hasAttemptedGeneration = false;
  }

  private isProtectedBufferTrack(name: string): boolean {
    const title = this.normalizeTrackName(name)
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    const protectedTitles = [
      'swim',
      'haegeum',
      'wild flower',
      'dont say you love me',
      'killin it girl',
    ];

    return protectedTitles.some(
      (protectedTitle) => title === protectedTitle || title.startsWith(protectedTitle + ' '),
    );
  }

  private async loadSupportTracks(
    excludedNames: Set<string>,
    requiredCount: number,
  ): Promise<SpotifyTrack[]> {
    const queries = [
      'artist:BTS',
      'artist:RM',
      'artist:j-hope',
      'artist:Jin',
      'artist:Jimin',
      'artist:V',
      'artist:"Jung Kook"',
      'artist:"Agust D"',
    ];

    const results = await Promise.all(
      queries.map((query) => this.spotifyService.searchTracks(query)),
    );

    const uniqueTracks = new Map<string, SpotifyTrack>();

    const allowedArtists = new Set([
      'bts',
      'rm',
      'j-hope',
      'jin',
      'jimin',
      'v',
      'jungkook',
      'jung kook',
      'agust d',
      'suga',
    ]);

    for (const group of results) {
      for (const track of group) {
        const nameKey = this.normalizeTrackName(track.name);

        if (!track.id) continue;
        if (excludedNames.has(nameKey)) continue;
        if (this.isProtectedBufferTrack(track.name)) continue;

        const hasEligibleArtist = track.artists.some((artist) =>
          allowedArtists.has(artist.name.trim().toLowerCase()),
        );

        if (!hasEligibleArtist) continue;

        if (!uniqueTracks.has(track.id)) {
          uniqueTracks.set(track.id, track);
        }
      }
    }

    const candidates = [...uniqueTracks.values()];

    // Shuffle the eligible tracks so each generation can vary.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    if (candidates.length < 4) {
      throw new Error(
        'Spotify returned fewer than four eligible tracks for the opening ' +
          'and closing buffers. Please try again.',
      );
    }

    // Return every available candidate if the search cannot meet the target.
    // The generator can use shorter gaps rather than failing completely.
    return candidates.slice(0, Math.max(requiredCount, candidates.length));
  }

  private async loadLowStreamTracks(
    excludedNames: Set<string>,
    excludedIds: Set<string>,
  ): Promise<SpotifyTrack[]> {
    // Different searches discover new non-BTS candidates each generation.
    const queries = [
      'genre:indie',
      'genre:bedroom-pop',
      'genre:alternative',
      'genre:indie-pop',
      'genre:acoustic',
      'genre:folk',
    ];

    const shuffle = <T>(items: T[]): T[] => {
      const result = [...items];

      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }

      return result;
    };

    const allowedBtsArtists = new Set([
      'bts',
      'rm',
      'j-hope',
      'jin',
      'jimin',
      'v',
      'jungkook',
      'jung kook',
      'agust d',
      'suga',
    ]);

    // Shuffle the queries so every generation explores a different order.
    const shuffledQueries = shuffle(queries);

    const results = await Promise.all(
      shuffledQueries.map((query) => this.spotifyService.searchTracks(query)),
    );

    const candidates = new Map<string, SpotifyTrack>();

    for (const tracks of results) {
      for (const track of tracks) {
        if (!track.id || excludedIds.has(track.id)) continue;

        const nameKey = this.normalizeTrackName(track.name);

        if (excludedNames.has(nameKey)) continue;

        // Reject tracks whose listed artists include BTS or a BTS member.
        const includesBtsArtist = track.artists.some((artist) =>
          allowedBtsArtists.has(artist.name.trim().toLowerCase()),
        );

        if (includesBtsArtist) continue;

        // Keep each Spotify track only once.
        if (!candidates.has(track.id)) {
          candidates.set(track.id, track);
        }
      }
    }

    const available = shuffle([...candidates.values()]);

    if (available.length < 2) {
      throw new Error(
        'Spotify did not return two distinct non-BTS tracks. ' + 'Please generate again.',
      );
    }

    // Return exactly two different tracks for this playlist.
    return available.slice(0, 2);
  }
}
