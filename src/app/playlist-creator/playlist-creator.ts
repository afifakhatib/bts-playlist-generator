// // // ng serve -o --host 127.0.0.1 --port 4200

// import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
// // import {  Component, inject } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import {
//   SpotifyService,
//   SpotifyTrack,
//   SpotifyAlbum,
//   SpotifyPlaylist,
// } from '../services/spotify.service';

// @Component({
//   selector: 'app-playlist-creator',
//   imports: [FormsModule],
//   templateUrl: './playlist-creator.html',
//   styleUrl: './playlist-creator.scss',
// })
// export class PlaylistCreator implements OnInit {
//   private spotifyService = inject(SpotifyService);

//   // constructor(private cdRef: ChangeDetectorRef) {
//   //   this.checkSpotifyConnection();
//   // }

//   private cdr = inject(ChangeDetectorRef);
//   ngOnInit(): void {
//     this.checkSpotifyConnection();
//   }

//   // Spotify playlist creation
//   isCreatingSpotifyPlaylist = false;
//   createdSpotifyPlaylist: SpotifyPlaylist | null = null;
//   spotifyPlaylistError = '';

//   // Generation and preview
//   hasAttemptedGeneration = false;
//   isGenerating = false;
//   generatedPlaylistSequence: string[] = [];
//   generatedFocusSequence: string[] = [];

//   // Focus-track configuration
//   focusSong1 = '';
//   focusSong2 = '';
//   focusCount1 = 10;
//   focusCount2 = 9;

//   selectedSpotifyTrack1: SpotifyTrack | null = null;
//   selectedSpotifyTrack2: SpotifyTrack | null = null;

//   // Album configuration
//   album1 = '';
//   album2 = '';

//   selectedSpotifyAlbum1: SpotifyAlbum | null = null;
//   selectedSpotifyAlbum2: SpotifyAlbum | null = null;

//   // Playlist rules
//   openingBuffers = 2;
//   closingBuffers = 2;
//   lowStreamTracks = 2;
//   fillerCount = 2;
//   nonBtsTracks = 2;
//   confirmBufferRules = true;
//   fillerDuration1 = 4.5;
//   fillerDuration2 = 4.5;

//   // Spotify connection
//   spotifyConnected = false;

//   connectSpotify(): void {
//     this.spotifyService.login();
//   }

//   checkSpotifyConnection(): void {
//     this.spotifyConnected = this.spotifyService.isConnected();
//     this.cdr.markForCheck();
//   }

//   // Track search, shown inside the Focus Tracks section
//   spotifyTrackQuery = '';
//   spotifyTracks: SpotifyTrack[] = [];
//   trackSearchLoading = false;

//   // Album search, shown inside the Album Selection section
//   spotifyAlbumQuery = '';
//   spotifyAlbums: SpotifyAlbum[] = [];
//   albumSearchLoading = false;

//   spotifySearchError = '';

//   async searchSpotifyTracks(): Promise<void> {
//     const query = this.spotifyTrackQuery.trim();

//     if (!this.spotifyConnected) {
//       this.spotifySearchError = 'Connect Spotify before searching.';
//       return;
//     }

//     if (!query) {
//       this.spotifyTracks = [];
//       this.spotifySearchError = 'Enter a song title to search.';
//       return;
//     }

//     this.trackSearchLoading = true;
//     this.spotifySearchError = '';
//     this.spotifyTracks = [];

//     try {
//       this.spotifyTracks = await this.spotifyService.searchTracks(query);

//       if (this.spotifyTracks.length === 0) {
//         this.spotifySearchError = 'No tracks found. Try another search.';
//       }
//     } catch (error) {
//       this.spotifySearchError =
//         error instanceof Error ? error.message : 'Spotify track search failed.';
//     } finally {
//       this.trackSearchLoading = false;
//     }
//   }

//   async searchSpotifyAlbums(): Promise<void> {
//     const query = this.spotifyAlbumQuery.trim();

//     if (!this.spotifyConnected) {
//       this.spotifySearchError = 'Connect Spotify before searching.';
//       return;
//     }

//     if (!query) {
//       this.spotifyAlbums = [];
//       this.spotifySearchError = 'Enter an album title to search.';
//       return;
//     }

//     this.albumSearchLoading = true;
//     this.spotifySearchError = '';
//     this.spotifyAlbums = [];

//     try {
//       this.spotifyAlbums = await this.spotifyService.searchAlbums(query);

//       if (this.spotifyAlbums.length === 0) {
//         this.spotifySearchError = 'No albums found. Try another search.';
//       }
//     } catch (error) {
//       this.spotifySearchError =
//         error instanceof Error ? error.message : 'Spotify album search failed.';
//     } finally {
//       this.albumSearchLoading = false;
//     }
//   }

//   chooseSpotifyTrack(track: SpotifyTrack, slot: 1 | 2): void {
//     if (slot === 1) {
//       this.selectedSpotifyTrack1 = track;
//       this.focusSong1 = track.name;
//     } else {
//       this.selectedSpotifyTrack2 = track;
//       this.focusSong2 = track.name;
//     }

//     this.spotifyTrackQuery = '';
//     this.spotifyTracks = [];
//     this.spotifySearchError = '';
//   }

//   chooseSpotifyAlbum(album: SpotifyAlbum, slot: 1 | 2): void {
//     if (slot === 1) {
//       this.selectedSpotifyAlbum1 = album;
//       this.album1 = album.name;
//     } else {
//       this.selectedSpotifyAlbum2 = album;
//       this.album2 = album.name;
//     }

//     this.spotifyAlbumQuery = '';
//     this.spotifyAlbums = [];
//     this.spotifySearchError = '';
//   }

//   selectAlbum2(album: string): void {
//     this.album2 = album;

//     if (!album.trim()) {
//       this.selectedSpotifyAlbum2 = null;
//     }

//     this.spotifyAlbums = [];
//     this.spotifyAlbumQuery = '';
//     this.spotifySearchError = '';
//   }

//   formatArtists(artists: { name: string }[]): string {
//     return artists.map((artist) => artist.name).join(', ');
//   }

//   get validationErrors(): string[] {
//     const errors: string[] = [];
//     const hasSong1 = this.focusSong1.trim().length > 0;
//     const hasSong2 = this.focusSong2.trim().length > 0;
//     const focusCount = Number(hasSong1) + Number(hasSong2);

//     if (this.hasAttemptedGeneration && !hasSong1 && !hasSong2) {
//       errors.push('Choose at least one focus song.');
//     }

//     if (
//       hasSong1 &&
//       hasSong2 &&
//       this.focusSong1.trim().toLowerCase() === this.focusSong2.trim().toLowerCase()
//     ) {
//       errors.push('Choose two different focus songs.');
//     }

//     if (hasSong1) {
//       const max = focusCount === 1 ? 12 : 10;

//       if (
//         !Number.isInteger(Number(this.focusCount1)) ||
//         this.focusCount1 < 1 ||
//         this.focusCount1 > max
//       ) {
//         errors.push(`Focus Song 1 must have 1–${max} plays.`);
//       }
//     }

//     if (hasSong2) {
//       if (
//         !Number.isInteger(Number(this.focusCount2)) ||
//         this.focusCount2 < 1 ||
//         this.focusCount2 > 10
//       ) {
//         errors.push('Focus Song 2 must have 1–10 plays.');
//       }
//     }

//     if (this.album2.trim() && !this.album1.trim()) {
//       errors.push('Enter Album 1 before selecting Album 2.');
//     }

//     if (focusCount === 2 && this.album2.trim()) {
//       errors.push('Two focus songs can be combined with at most one album.');
//     }

//     if (this.openingBuffers !== 2) {
//       errors.push('You must have exactly 2 opening buffer tracks.');
//     }

//     if (this.closingBuffers !== 2) {
//       errors.push('You must have exactly 2 closing buffer tracks.');
//     }

//     if (!this.confirmBufferRules) {
//       errors.push('Confirm that all four buffer tracks are non-focus and non-charting.');
//     }

//     if (this.lowStreamTracks !== 2) {
//       errors.push('Every playlist must contain exactly 2 low-stream tracks.');
//     }

//     if (this.fillerCount < 2 || this.fillerCount > 5) {
//       errors.push('Use 3–4 fillers normally; 5 is the rare maximum.');
//     }

//     // if (this.fillerCount === 2) {
//     //   const total = this.fillerDuration1 + this.fillerDuration2;

//     //   if (this.fillerDuration1 <= 4 || this.fillerDuration2 <= 4 || total < 8 || total > 10) {
//     //     errors.push(
//     //       'The 2-filler exception requires both tracks to exceed 4 minutes and total 8–10 minutes.',
//     //     );
//     //   }
//     // }

//     if (this.fillerCount === 2) {
//       if (this.fillerDuration1 < 4 || this.fillerDuration2 < 4) {
//         errors.push('When using 2 fillers, each track must be at least 4 minutes long.');
//       }
//     }

//     if (this.nonBtsTracks < 2 || this.nonBtsTracks > 3) {
//       errors.push('Use only 2–3 non-BTS/local tracks.');
//     }

//     return errors;
//   }

//   get validationWarnings(): string[] {
//     return this.fillerCount === 5 ? ['Five fillers should be used only rarely.'] : [];
//   }

//   async generatePlaylist(): Promise<void> {
//     if (this.isGenerating) return;

//     this.hasAttemptedGeneration = true;
//     this.spotifySearchError = '';

//     if (this.validationErrors.length > 0) return;

//     this.isGenerating = true;
//     this.cdr.markForCheck();

//     try {
//       const normalize = (name: string) => this.normalizeTrackName(name);

//       const shuffle = <T>(items: T[]): T[] => {
//         const result = [...items];

//         for (let i = result.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [result[i], result[j]] = [result[j], result[i]];
//         }

//         return result;
//       };

//       type FocusItem = { name: string; key: string };

//       const focusItems: FocusItem[] = [];

//       const addFocus = (name: string, count: number): void => {
//         const cleanName = name.trim();

//         if (!cleanName) return;

//         for (let i = 0; i < Number(count); i++) {
//           focusItems.push({
//             name: cleanName,
//             key: normalize(cleanName),
//           });
//         }
//       };

//       addFocus(this.focusSong1, Number(this.focusCount1));
//       addFocus(this.focusSong2, Number(this.focusCount2));

//       if (focusItems.length === 0) {
//         throw new Error('Choose at least one focus song.');
//       }

//       const focusCounts = new Map<string, number>();

//       for (const item of focusItems) {
//         focusCounts.set(item.key, (focusCounts.get(item.key) ?? 0) + 1);
//       }

//       const hasTwoFocusSongs = Boolean(this.focusSong1.trim()) && Boolean(this.focusSong2.trim());

//       if (hasTwoFocusSongs && normalize(this.focusSong1) === normalize(this.focusSong2)) {
//         throw new Error('Choose two different focus songs.');
//       }

//       // Arrange focus plays while avoiding consecutive identical focus songs
//       // whenever another focus song is available.
//       const remaining = new Map<string, FocusItem[]>();

//       for (const item of shuffle(focusItems)) {
//         const list = remaining.get(item.key) ?? [];
//         list.push(item);
//         remaining.set(item.key, list);
//       }

//       const fillerCountOptions = [2, 3, 3, 3, 4, 4, 4, 4, 5];

//       const focusSequence: FocusItem[] = [];
//       let previousKey = '';

//       while ([...remaining.values()].some((list) => list.length > 0)) {
//         let available = [...remaining.entries()]
//           .filter(([, list]) => list.length > 0)
//           .map(([key, list]) => ({
//             key,
//             item: list[0],
//             count: list.length,
//           }));

//         const alternatives = available.filter((option) => option.key !== previousKey);

//         if (alternatives.length > 0) {
//           available = alternatives;
//         }

//         const highest = Math.max(...available.map((option) => option.count));

//         const choices = shuffle(available.filter((option) => option.count === highest));

//         const chosen = choices[0];

//         focusSequence.push(chosen.item);
//         remaining.get(chosen.key)!.shift();
//         previousKey = chosen.key;
//       }

//       // Fetch every distinct Spotify track from the selected albums.
//       // Different Spotify IDs are preserved, including clean/explicit versions.
//       const albumTracks: SpotifyTrack[] = [];
//       const seenAlbumIds = new Set<string>();
//       const seenAlbumTrackIds = new Set<string>();

//       const selections = [
//         { title: this.album1, album: this.selectedSpotifyAlbum1 },
//         { title: this.album2, album: this.selectedSpotifyAlbum2 },
//       ];

//       for (const selection of selections) {
//         const title = selection.title?.trim();

//         if (!title || title.toLowerCase() === 'none') continue;

//         const album = selection.album;

//         if (!album) {
//           throw new Error(
//             `Please select the Spotify album for "${title}" from the search results.`,
//           );
//         }

//         if (seenAlbumIds.has(album.id)) continue;
//         seenAlbumIds.add(album.id);

//         const tracks = await this.spotifyService.getAlbumTracks(album.id, 'US');

//         for (const track of tracks) {
//           if (!track.id || seenAlbumTrackIds.has(track.id)) continue;

//           // Do not add a focus song again as an album track.
//           const trackKey = normalize(track.name);

//           if (focusCounts.has(trackKey)) continue;

//           seenAlbumTrackIds.add(track.id);
//           albumTracks.push(track);
//         }
//       }

//       // Exclude focus and album titles from ordinary support tracks.
//       const excludedNames = new Set<string>([
//         ...focusCounts.keys(),
//         ...albumTracks.map((track) => normalize(track.name)),
//       ]);

//       const supportTracks = await this.loadSupportTracks(excludedNames, 100);

//       const bufferCandidates = shuffle(
//         supportTracks.filter((track) => !this.isProtectedBufferTrack(track.name)),
//       );

//       if (bufferCandidates.length < 4) {
//         throw new Error('Not enough eligible tracks for the two opening and two closing buffers.');
//       }

//       // Reserve four distinct buffers first.
//       const openingBuffers = bufferCandidates.slice(0, 2);
//       const closingBuffers = bufferCandidates.slice(2, 4);

//       const bufferIds = new Set([
//         ...openingBuffers.map((track) => track.id),
//         ...closingBuffers.map((track) => track.id),
//       ]);

//       const fillerPool = shuffle(supportTracks.filter((track) => !bufferIds.has(track.id)));

//       // Determine how many tracks can fit between focus placements.
//       // With two alternating focus songs, the other focus song also counts
//       // as an intervening track. Avoid consecutive two-track gaps.
//       const gapCount = Math.max(0, focusSequence.length - 1);
//       const gapTargets: number[] = [];

//       for (let i = 0; i < gapCount; i++) {
//         const sameAsNext = focusSequence[i].key === focusSequence[i + 1].key;

//         if (!hasTwoFocusSongs || sameAsNext) {
//           gapTargets.push(3 + Math.floor(Math.random() * 2));
//         } else {
//           let target = 1 + Math.floor(Math.random() * 2);

//           if (i > 0 && gapTargets[i - 1] === 2) {
//             target = 1;
//           }

//           gapTargets.push(target);
//         }
//       }

//       const gaps: SpotifyTrack[][] = Array.from({ length: gapCount }, () => []);

//       const albumCapacity = gapTargets.reduce((total, target) => total + target, 0);

//       // A single focus play has no between-focus gaps, so albums are placed
//       // separately below. Otherwise, preserve every album track.
//       if (gapCount > 0 && albumTracks.length > albumCapacity) {
//         throw new Error(
//           `All ${albumTracks.length} album tracks need to be included, ` +
//             `but this arrangement has only ${albumCapacity} available slots. ` +
//             'Try a configuration with more focus plays.',
//         );
//       }

//       // Spread album tracks across different gaps instead of grouping them.
//       // const gapOrder = shuffle(Array.from({ length: gapCount }, (_, index) => index));

//       // for (const track of shuffle(albumTracks)) {
//       //   if (gapCount === 0) break;

//       //   const availableGap = gapOrder.find((index) => gaps[index].length < gapTargets[index]);

//       //   if (availableGap === undefined) {
//       //     throw new Error('Could not place every selected album track.');
//       //   }

//       //   gaps[availableGap].push(track);
//       // }

//       // Spread album tracks round-robin across available gaps.
//       // Fill one position in each gap before filling a second position.
//       const gapOrder = shuffle(Array.from({ length: gapCount }, (_, index) => index));

//       const remainingAlbumTracks = shuffle([...albumTracks]);

//       while (remainingAlbumTracks.length > 0) {
//         let placedThisRound = false;

//         for (const gapIndex of gapOrder) {
//           if (remainingAlbumTracks.length === 0) break;

//           if (gaps[gapIndex].length >= gapTargets[gapIndex]) {
//             continue;
//           }

//           gaps[gapIndex].push(remainingAlbumTracks.shift()!);
//           placedThisRound = true;
//         }

//         if (!placedThisRound) {
//           throw new Error('Could not distribute every selected album track across the playlist.');
//         }
//       }

//       // Fill remaining gap slots with BTS-related supporting tracks.
//       // const requiredFillers = gaps.reduce(
//       //   (total, gap, index) => total + gapTargets[index] - gap.length,
//       //   0,
//       // );

//       // if (requiredFillers > 0 && fillerPool.length === 0) {
//       //   throw new Error('Not enough supporting tracks to fill the playlist gaps.');
//       // }

//       // let fillerIndex = 0;

//       // for (let i = 0; i < gapCount; i++) {
//       //   while (gaps[i].length < gapTargets[i]) {
//       //     gaps[i].push(fillerPool[fillerIndex % fillerPool.length]);

//       //     fillerIndex++;
//       //   }

//       //   gaps[i] = shuffle(gaps[i]);
//       // }

//       // Fill remaining gap slots with unique BTS-related tracks.
//       // const requiredFillers = gaps.reduce(
//       //   (total, gap, index) => total + gapTargets[index] - gap.length,
//       //   0,
//       // );

//       // Exclude focus songs, album tracks, and reserved buffers.
//       const usedFillerIds = new Set<string>([
//         ...albumTracks.map((track) => track.id),
//         ...openingBuffers.map((track) => track.id),
//         ...closingBuffers.map((track) => track.id),
//       ]);

//       const usedFillerNames = new Set<string>([
//         ...focusCounts.keys(),
//         ...albumTracks.map((track) => normalize(track.name)),
//         ...openingBuffers.map((track) => normalize(track.name)),
//         ...closingBuffers.map((track) => normalize(track.name)),
//       ]);

//       const uniqueFillerPool = shuffle(
//         fillerPool.filter(
//           (track) => !usedFillerIds.has(track.id) && !usedFillerNames.has(normalize(track.name)),
//         ),
//       );

//       console.log('Filler pool breakdown:', {
//         supportTracks: supportTracks.length,
//         reservedBuffers: bufferIds.size,
//         fillerPool: fillerPool.length,
//         albumTracks: albumTracks.length,
//         uniqueFillerPool: uniqueFillerPool.length,
//         excludedFillerNames: [...usedFillerNames],
//         excludedFillerIds: [...usedFillerIds],
//       });
//       // When using the 2-filler exception, reserve two actual
//       // Spotify tracks that are each at least 4 minutes long.
//       // Select exactly two designated BTS fillers, each at least 4 minutes.
//       const selectedLongFillers: SpotifyTrack[] = [];

//       if (this.fillerCount === 2) {
//         const longFillers = shuffle(
//           uniqueFillerPool.filter((track) => track.duration_ms >= 4 * 60 * 1000),
//         );

//         if (longFillers.length < 2) {
//           throw new Error(
//             'Could not find two distinct BTS filler tracks that are each at least 4 minutes long. ' +
//               'Please generate again.',
//           );
//         }

//         selectedLongFillers.push(...longFillers.slice(0, 2));
//       }

//       /////////////////////////

//       // For a single focus song with no album, fit the gaps
//       // to the available unique fillers instead of requiring 3–4 each.

//       // For one focus song with no album, target exactly 45 playlist tracks.
//       // Four buffers are added separately, so calculate the required gap slots.
//       if (!hasTwoFocusSongs && albumTracks.length === 0 && gapCount > 0) {
//         const targetPlaylistLength = 45;
//         const bufferCount = openingBuffers.length + closingBuffers.length;

//         const requiredGapSlots =
//           targetPlaylistLength - bufferCount - focusSequence.length - albumTracks.length;

//         const minimumGapSlots = gapCount * 2;
//         const maximumGapSlots = gapCount * 3;

//         if (requiredGapSlots < minimumGapSlots || requiredGapSlots > maximumGapSlots) {
//           throw new Error(
//             `Cannot make a ${targetPlaylistLength}-track playlist while keeping ` +
//               `2–3 tracks between focus plays. Required gap slots: ${requiredGapSlots}.`,
//           );
//         }

//         if (uniqueFillerPool.length < requiredGapSlots) {
//           throw new Error(
//             `Need ${requiredGapSlots} unique supporting tracks to reach 45 tracks, ` +
//               `but only ${uniqueFillerPool.length} are available.`,
//           );
//         }

//         // Begin with two tracks in every gap.
//         gapTargets.fill(2);

//         // Add exactly enough third tracks to reach 45 total.
//         const extraSlots = requiredGapSlots - minimumGapSlots;
//         const shuffledGapIndexes = shuffle(Array.from({ length: gapCount }, (_, index) => index));

//         for (const index of shuffledGapIndexes.slice(0, extraSlots)) {
//           gapTargets[index] = 3;
//         }
//       }

//       // Calculate the filler requirement after adjusting gap sizes.
//       const requiredFillers = gaps.reduce(
//         (total, gap, index) => total + gapTargets[index] - gap.length,
//         0,
//       );

//       console.log('Playlist slot calculation:', {
//         focusPlays: focusSequence.length,
//         albumTracks: albumTracks.length,
//         openingBuffers: openingBuffers.length,
//         closingBuffers: closingBuffers.length,
//         gapCount,
//         gapTargets,
//         albumTracksPlacedInGaps: gaps.reduce((total, gap) => total + gap.length, 0),
//         requiredFillers,
//         uniqueFillerPool: uniqueFillerPool.length,
//         selectedLongFillers: selectedLongFillers.length,
//       });

//       if (uniqueFillerPool.length < requiredFillers) {
//         throw new Error(
//           `Not enough unique BTS fillers. Need ${requiredFillers}, ` +
//             `but only ${uniqueFillerPool.length} eligible tracks are available. ` +
//             'Please generate again.',
//         );
//       }

//       let fillerIndex = 0;

//       // Insert the two designated long fillers into separate available gaps.
//       if (selectedLongFillers.length === 2) {
//         const availableGapIndexes = shuffle(
//           gaps
//             .map((gap, index) => ({ gap, index }))
//             .filter(({ gap, index }) => gap.length < gapTargets[index])
//             .map(({ index }) => index),
//         );

//         if (availableGapIndexes.length < 2) {
//           throw new Error('There are not enough separate gap slots for both designated fillers.');
//         }

//         for (let i = 0; i < 2; i++) {
//           const gapIndex = availableGapIndexes[i];
//           gaps[gapIndex].push(selectedLongFillers[i]);

//           usedFillerIds.add(selectedLongFillers[i].id);
//           usedFillerNames.add(normalize(selectedLongFillers[i].name));
//         }
//       }

//       // Fill all remaining slots without repeating filler tracks.
//       const selectedLongIds = new Set(selectedLongFillers.map((track) => track.id));

//       const remainingFillers = uniqueFillerPool.filter((track) => !selectedLongIds.has(track.id));

//       for (let i = 0; i < gapCount; i++) {
//         while (gaps[i].length < gapTargets[i]) {
//           const filler = remainingFillers[fillerIndex++];

//           if (!filler) {
//             throw new Error('Not enough unique BTS tracks to fill all playlist gaps.');
//           }

//           gaps[i].push(filler);
//           usedFillerIds.add(filler.id);
//           usedFillerNames.add(normalize(filler.name));
//         }

//         gaps[i] = shuffle(gaps[i]);
//       }

//       // Assemble the main sequence.
//       const mainTracks: string[] = [];

//       for (let i = 0; i < focusSequence.length; i++) {
//         mainTracks.push(focusSequence[i].name);

//         if (i < gapCount) {
//           mainTracks.push(...gaps[i].map((track) => track.name));
//         }
//       }

//       // If there is only one focus play, there are no gaps to use.
//       // Insert every selected album track around that focus play.
//       if (gapCount === 0 && albumTracks.length > 0) {
//         const shuffledAlbums = shuffle(albumTracks);
//         const focusIndex = mainTracks.findIndex((name) => normalize(name) === focusSequence[0].key);

//         const beforeCount = Math.floor(Math.random() * (shuffledAlbums.length + 1));

//         mainTracks.splice(
//           Math.max(0, focusIndex),
//           0,
//           ...shuffledAlbums.slice(0, beforeCount).map((track) => track.name),
//         );

//         mainTracks.splice(
//           Math.max(0, focusIndex) + beforeCount + (focusIndex >= 0 ? 1 : 0),
//           0,
//           ...shuffledAlbums.slice(beforeCount).map((track) => track.name),
//         );
//       }

//       // Select exactly two distinct non-BTS low-stream candidates.
//       // Replace existing filler slots instead of adding tracks, so
//       // focus-song spacing and total playlist length remain unchanged.
//       const excludedLowStreamNames = new Set<string>([
//         ...focusCounts.keys(),
//         ...albumTracks.map((track) => normalize(track.name)),
//         ...openingBuffers.map((track) => normalize(track.name)),
//         ...closingBuffers.map((track) => normalize(track.name)),
//       ]);

//       const excludedLowStreamIds = new Set<string>([
//         ...albumTracks.map((track) => track.id),
//         ...openingBuffers.map((track) => track.id),
//         ...closingBuffers.map((track) => track.id),
//       ]);

//       const lowStreamTracks = await this.loadLowStreamTracks(
//         excludedLowStreamNames,
//         excludedLowStreamIds,
//       );

//       // Replace two different non-focus filler slots in separate
//       // sections of the main sequence; never replace album/focus tracks.
//       // const protectedMainNames = new Set<string>([
//       //   ...focusCounts.keys(),
//       //   ...albumTracks.map((track) => normalize(track.name)),
//       // ]);

//       const protectedMainNames = new Set<string>([
//         ...focusCounts.keys(),
//         ...albumTracks.map((track) => normalize(track.name)),
//         ...selectedLongFillers.map((track) => normalize(track.name)),
//       ]);

//       const replaceableIndices = mainTracks
//         .map((name, index) => ({ name, index }))
//         .filter(({ name }) => !protectedMainNames.has(normalize(name)))
//         .map(({ index }) => index);

//       if (replaceableIndices.length < 2) {
//         throw new Error('Not enough non-focus filler slots for the two low-stream tracks.');
//       }

//       const firstTarget = Math.floor(mainTracks.length * 0.35);
//       const secondTarget = Math.floor(mainTracks.length * 0.7);

//       const pickNearest = (target: number, used: Set<number>): number | undefined =>
//         replaceableIndices
//           .filter((index) => !used.has(index))
//           .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];

//       const chosenIndices = new Set<number>();

//       const firstIndex = pickNearest(firstTarget, chosenIndices);

//       if (firstIndex === undefined) {
//         throw new Error('Could not place the first low-stream track.');
//       }

//       chosenIndices.add(firstIndex);

//       const secondIndex = pickNearest(secondTarget, chosenIndices);

//       if (secondIndex === undefined) {
//         throw new Error('Could not place the second low-stream track.');
//       }

//       mainTracks[firstIndex] = lowStreamTracks[0].name;
//       mainTracks[secondIndex] = lowStreamTracks[1].name;

//       console.log(
//         'Selected long fillers:',
//         selectedLongFillers.map((track) => ({
//           name: track.name,
//           duration: (track.duration_ms / 60000).toFixed(2) + ' min',
//         })),
//       );

//       console.log(
//         'Low-stream tracks:',
//         lowStreamTracks.map((track) => track.name),
//       );

//       const finalSequence = [
//         ...openingBuffers.map((track) => track.name),
//         ...mainTracks,
//         ...closingBuffers.map((track) => track.name),
//       ];

//       // Validate exact focus counts and spacing in the FINAL playlist.
//       // Album versions with distinct Spotify IDs remain separate tracks.
//       for (const [key, expected] of focusCounts) {
//         const positions = finalSequence
//           .map((name, index) => (normalize(name) === key ? index : -1))
//           .filter((index) => index !== -1);

//         if (positions.length !== expected) {
//           throw new Error(
//             `Expected ${expected} plays of "${key}", but generated ${positions.length}.`,
//           );
//         }

//         for (let i = 1; i < positions.length; i++) {
//           const interveningTracks = positions[i] - positions[i - 1] - 1;

//           const minGap = !hasTwoFocusSongs && albumTracks.length === 0 ? 2 : 3;

//           const maxGap = !hasTwoFocusSongs && albumTracks.length === 0 ? 3 : 4;

//           if (interveningTracks < minGap || interveningTracks > maxGap) {
//             throw new Error(
//               `Spacing check failed for "${finalSequence[positions[i]]}": ` +
//                 `${interveningTracks} tracks between plays. ` +
//                 'The arrangement needs to be adjusted.',
//             );
//           }
//         }
//       }

//       // Keep the preview visible and clear configuration only on success.
//       this.generatedPlaylistSequence = finalSequence;
//       this.generatedFocusSequence = focusSequence.map((item) => item.name);

//       console.log('Generated playlist:', finalSequence);
//       console.log('Total tracks:', finalSequence.length);

//       console.log('FINAL PLAYLIST DEBUG:', {
//         focusPlays: focusSequence.length,
//         albumTracks: albumTracks.length,
//         openingBuffers: openingBuffers.length,
//         closingBuffers: closingBuffers.length,
//         mainTracks: mainTracks.length,
//         finalTracks: finalSequence.length,
//         gapTargets,
//         gapLengths: gaps.map((gap) => gap.length),
//       });

//       this.focusSong1 = '';
//       this.focusSong2 = '';
//       this.focusCount1 = 10;
//       this.focusCount2 = 9;

//       this.album1 = '';
//       this.album2 = '';
//       this.selectedSpotifyAlbum1 = null;
//       this.selectedSpotifyAlbum2 = null;
//       this.selectedSpotifyTrack1 = null;
//       this.selectedSpotifyTrack2 = null;

//       this.spotifyTrackQuery = '';
//       this.spotifyAlbumQuery = '';
//       this.spotifyTracks = [];
//       this.spotifyAlbums = [];

//       this.hasAttemptedGeneration = false;
//     } catch (error) {
//       console.error('PLAYLIST GENERATION FAILED:', error);
//       this.spotifySearchError =
//         error instanceof Error ? error.message : 'Unable to generate the playlist.';
//     } finally {
//       this.isGenerating = false;
//       this.cdr.markForCheck();
//     }
//   }

//   async createSpotifyPlaylist(): Promise<void> {
//     if (this.isCreatingSpotifyPlaylist) return;

//     if (!this.spotifyConnected) {
//       this.spotifyPlaylistError = 'Connect to Spotify first.';
//       return;
//     }

//     if (this.generatedPlaylistSequence.length === 0) {
//       this.spotifyPlaylistError = 'Generate a playlist first.';
//       return;
//     }

//     this.isCreatingSpotifyPlaylist = true;
//     this.spotifyPlaylistError = '';
//     this.createdSpotifyPlaylist = null;
//     this.cdr.markForCheck();

//     try {
//       const trackCache = new Map<string, SpotifyTrack>();

//       // Resolve each preview title to a Spotify track.
//       for (const title of this.generatedPlaylistSequence) {
//         const key = this.normalizeTrackName(title);

//         if (trackCache.has(key)) continue;

//         const results = await this.spotifyService.searchTracks(title);

//         const exactMatch = results.find((track) => this.normalizeTrackName(track.name) === key);

//         if (!exactMatch) {
//           throw new Error(`Could not find an exact Spotify match for "${title}".`);
//         }

//         trackCache.set(key, exactMatch);
//       }

//       // Preserve playlist order and repeated plays.
//       const trackIds = this.generatedPlaylistSequence.map(
//         (title) => trackCache.get(this.normalizeTrackName(title))!.id,
//       );

//       const playlist = await this.spotifyService.createPlaylist(
//         `HEARTBEAT 💜 ${new Date().toLocaleDateString()}`,
//         'A BTS-focused playlist generated with HEARTBEAT.',
//       );

//       this.createdSpotifyPlaylist = playlist;

//       await this.spotifyService.addTracksToPlaylist(playlist.id, trackIds);
//     } catch (error) {
//       this.spotifyPlaylistError =
//         error instanceof Error ? error.message : 'Could not create your Spotify playlist.';
//     } finally {
//       this.isCreatingSpotifyPlaylist = false;
//       this.cdr.markForCheck();
//     }
//   }

//   private normalizeTrackName(name: string): string {
//     return name.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
//   }

//   private resetConfiguration(): void {
//     this.focusSong1 = '';
//     this.focusSong2 = '';
//     this.focusCount1 = 10;
//     this.focusCount2 = 9;

//     this.selectedSpotifyTrack1 = null;
//     this.selectedSpotifyTrack2 = null;

//     this.album1 = '';
//     this.album2 = '';
//     this.selectedSpotifyAlbum1 = null;
//     this.selectedSpotifyAlbum2 = null;

//     this.spotifyTrackQuery = '';
//     this.spotifyAlbumQuery = '';
//     this.spotifyTracks = [];
//     this.spotifyAlbums = [];

//     this.spotifySearchError = '';
//     this.hasAttemptedGeneration = false;
//   }

//   private isProtectedBufferTrack(name: string): boolean {
//     const title = this.normalizeTrackName(name)
//       .replace(/[^a-z0-9]+/g, ' ')
//       .trim();

//     const protectedTitles = [
//       'swim',
//       'haegeum',
//       'wild flower',
//       'dont say you love me',
//       'killin it girl',
//     ];

//     return protectedTitles.some(
//       (protectedTitle) => title === protectedTitle || title.startsWith(protectedTitle + ' '),
//     );
//   }

//   private async loadSupportTracks(
//     excludedNames: Set<string>,
//     requiredCount: number,
//   ): Promise<SpotifyTrack[]> {
//     const queries = [
//       'artist:BTS',
//       'artist:RM',
//       'artist:j-hope',
//       'artist:Jin',
//       'artist:Jimin',
//       'artist:V',
//       'artist:"Jung Kook"',
//       'artist:"Agust D"',
//     ];

//     // const results = await Promise.all(
//     //   queries.map((query) => this.spotifyService.searchTracks(query)),
//     // );

//     const results = await Promise.all(
//       queries.flatMap((query) => [
//         this.spotifyService.searchTracks(query, 0),
//         this.spotifyService.searchTracks(query, 10),
//         this.spotifyService.searchTracks(query, 20),
//       ]),
//     );

//     const uniqueTracks = new Map<string, SpotifyTrack>();

//     const allowedArtists = new Set([
//       'bts',
//       'rm',
//       'j-hope',
//       'jin',
//       'jimin',
//       'v',
//       'jungkook',
//       'jung kook',
//       'agust d',
//       'suga',
//     ]);

//     for (const group of results) {
//       for (const track of group) {
//         const nameKey = this.normalizeTrackName(track.name);

//         if (!track.id) continue;
//         if (excludedNames.has(nameKey)) continue;
//         if (this.isProtectedBufferTrack(track.name)) continue;

//         const hasEligibleArtist = track.artists.some((artist) =>
//           allowedArtists.has(artist.name.trim().toLowerCase()),
//         );

//         if (!hasEligibleArtist) continue;

//         if (!uniqueTracks.has(track.id)) {
//           uniqueTracks.set(track.id, track);
//         }
//       }
//     }

//     const candidates = [...uniqueTracks.values()];

//     console.log('Support track search results:', {
//       totalUniqueTracks: uniqueTracks.size,
//       excludedNames: [...excludedNames],
//       candidates: uniqueTracks.size,
//       trackNames: [...uniqueTracks.values()].map((track) => track.name),
//     });

//     // Shuffle the eligible tracks so each generation can vary.
//     for (let i = candidates.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));

//       [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
//     }

//     if (candidates.length < 4) {
//       throw new Error(
//         'Spotify returned fewer than four eligible tracks for the opening ' +
//           'and closing buffers. Please try again.',
//       );
//     }

//     // Return every available candidate if the search cannot meet the target.
//     // The generator can use shorter gaps rather than failing completely.
//     return candidates.slice(0, Math.max(requiredCount, candidates.length));
//   }

//   private async loadLowStreamTracks(
//     excludedNames: Set<string>,
//     excludedIds: Set<string>,
//   ): Promise<SpotifyTrack[]> {
//     // Different searches discover new non-BTS candidates each generation.
//     const queries = [
//       'genre:indie',
//       'genre:bedroom-pop',
//       'genre:alternative',
//       'genre:indie-pop',
//       'genre:acoustic',
//       'genre:folk',
//     ];

//     const shuffle = <T>(items: T[]): T[] => {
//       const result = [...items];

//       for (let i = result.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [result[i], result[j]] = [result[j], result[i]];
//       }

//       return result;
//     };

//     const allowedBtsArtists = new Set([
//       'bts',
//       'rm',
//       'j-hope',
//       'jin',
//       'jimin',
//       'v',
//       'jungkook',
//       'jung kook',
//       'agust d',
//       'suga',
//     ]);

//     // Shuffle the queries so every generation explores a different order.
//     const shuffledQueries = shuffle(queries);

//     const results = await Promise.all(
//       shuffledQueries.map((query) => this.spotifyService.searchTracks(query)),
//     );

//     const candidates = new Map<string, SpotifyTrack>();

//     for (const tracks of results) {
//       for (const track of tracks) {
//         if (!track.id || excludedIds.has(track.id)) continue;

//         const nameKey = this.normalizeTrackName(track.name);

//         if (excludedNames.has(nameKey)) continue;

//         // Reject tracks whose listed artists include BTS or a BTS member.
//         const includesBtsArtist = track.artists.some((artist) =>
//           allowedBtsArtists.has(artist.name.trim().toLowerCase()),
//         );

//         if (includesBtsArtist) continue;

//         // Keep each Spotify track only once.
//         if (!candidates.has(track.id)) {
//           candidates.set(track.id, track);
//         }
//       }
//     }

//     const available = shuffle([...candidates.values()]);

//     if (available.length < 2) {
//       throw new Error(
//         'Spotify did not return two distinct non-BTS tracks. ' + 'Please generate again.',
//       );
//     }

//     // Return exactly two different tracks for this playlist.
//     return available.slice(0, 2);
//   }
// }

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
  fillerCount = 3; // Retained for template compatibility; generation selects this automatically.
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

    // The designated filler count is selected automatically during generation.
    // For the 2-filler option, the generator checks the actual Spotify track
    // durations and requires both tracks to be at least 4 minutes long.

    if (this.nonBtsTracks < 2 || this.nonBtsTracks > 3) {
      errors.push('Use only 2–3 non-BTS/local tracks.');
    }

    return errors;
  }

  get validationWarnings(): string[] {
    return [];
  }

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

      // Weighted automatic selection: 3 and 4 are common, 2 occasional, 5 rare.
      const fillerCountOptions = [2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5];

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

          // Do not add a focus song again as an album track.
          const trackKey = normalize(track.name);

          if (focusCounts.has(trackKey)) continue;

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
      // const gapOrder = shuffle(Array.from({ length: gapCount }, (_, index) => index));

      // for (const track of shuffle(albumTracks)) {
      //   if (gapCount === 0) break;

      //   const availableGap = gapOrder.find((index) => gaps[index].length < gapTargets[index]);

      //   if (availableGap === undefined) {
      //     throw new Error('Could not place every selected album track.');
      //   }

      //   gaps[availableGap].push(track);
      // }

      // Spread album tracks round-robin across available gaps.
      // Fill one position in each gap before filling a second position.
      const gapOrder = shuffle(Array.from({ length: gapCount }, (_, index) => index));

      const remainingAlbumTracks = shuffle([...albumTracks]);

      while (remainingAlbumTracks.length > 0) {
        let placedThisRound = false;

        for (const gapIndex of gapOrder) {
          if (remainingAlbumTracks.length === 0) break;

          if (gaps[gapIndex].length >= gapTargets[gapIndex]) {
            continue;
          }

          gaps[gapIndex].push(remainingAlbumTracks.shift()!);
          placedThisRound = true;
        }

        if (!placedThisRound) {
          throw new Error('Could not distribute every selected album track across the playlist.');
        }
      }

      // Fill remaining gap slots with BTS-related supporting tracks.
      // const requiredFillers = gaps.reduce(
      //   (total, gap, index) => total + gapTargets[index] - gap.length,
      //   0,
      // );

      // if (requiredFillers > 0 && fillerPool.length === 0) {
      //   throw new Error('Not enough supporting tracks to fill the playlist gaps.');
      // }

      // let fillerIndex = 0;

      // for (let i = 0; i < gapCount; i++) {
      //   while (gaps[i].length < gapTargets[i]) {
      //     gaps[i].push(fillerPool[fillerIndex % fillerPool.length]);

      //     fillerIndex++;
      //   }

      //   gaps[i] = shuffle(gaps[i]);
      // }

      // Fill remaining gap slots with unique BTS-related tracks.
      // const requiredFillers = gaps.reduce(
      //   (total, gap, index) => total + gapTargets[index] - gap.length,
      //   0,
      // );

      // Exclude focus songs, album tracks, and reserved buffers.
      const usedFillerIds = new Set<string>([
        ...albumTracks.map((track) => track.id),
        ...openingBuffers.map((track) => track.id),
        ...closingBuffers.map((track) => track.id),
      ]);

      const usedFillerNames = new Set<string>([
        ...focusCounts.keys(),
        ...albumTracks.map((track) => normalize(track.name)),
        ...openingBuffers.map((track) => normalize(track.name)),
        ...closingBuffers.map((track) => normalize(track.name)),
      ]);

      // const uniqueFillerPool = shuffle(
      //   fillerPool.filter(
      //     (track) => !usedFillerIds.has(track.id) && !usedFillerNames.has(normalize(track.name)),
      //   ),
      // );

      // Keep only one Spotify result per normalized track title.
      // Different Spotify IDs with the same title must not create duplicates.
      const seenFillerNames = new Set<string>();

      const uniqueFillerPool = shuffle(fillerPool).filter((track) => {
        const trackKey = normalize(track.name);

        if (
          usedFillerIds.has(track.id) ||
          usedFillerNames.has(trackKey) ||
          seenFillerNames.has(trackKey)
        ) {
          return false;
        }

        seenFillerNames.add(trackKey);
        return true;
      });

      console.log('Filler pool breakdown:', {
        supportTracks: supportTracks.length,
        reservedBuffers: bufferIds.size,
        fillerPool: fillerPool.length,
        albumTracks: albumTracks.length,
        uniqueFillerPool: uniqueFillerPool.length,
        excludedFillerNames: [...usedFillerNames],
        excludedFillerIds: [...usedFillerIds],
      });
      // Designated fillers are chosen automatically after the final gap
      // capacity is known. The two-filler option uses two actual tracks that
      // are each at least 4 minutes long.
      let selectedDesignatedFillers: SpotifyTrack[] = [];

      /////////////////////////

      // For a single focus song with no album, fit the gaps
      // to the available unique fillers instead of requiring 3–4 each.

      // For one focus song with no album, target exactly 45 playlist tracks.
      // Four buffers are added separately, so calculate the required gap slots.
      if (!hasTwoFocusSongs && albumTracks.length === 0 && gapCount > 0) {
        const targetPlaylistLength = 45;
        const bufferCount = openingBuffers.length + closingBuffers.length;

        const requiredGapSlots =
          targetPlaylistLength - bufferCount - focusSequence.length - albumTracks.length;

        const minimumGapSlots = gapCount * 2;
        const maximumGapSlots = gapCount * 3;

        if (requiredGapSlots < minimumGapSlots || requiredGapSlots > maximumGapSlots) {
          throw new Error(
            `Cannot make a ${targetPlaylistLength}-track playlist while keeping ` +
              `2–3 tracks between focus plays. Required gap slots: ${requiredGapSlots}.`,
          );
        }

        if (uniqueFillerPool.length < requiredGapSlots) {
          throw new Error(
            `Need ${requiredGapSlots} unique supporting tracks to reach 45 tracks, ` +
              `but only ${uniqueFillerPool.length} are available.`,
          );
        }

        // Begin with two tracks in every gap.
        gapTargets.fill(2);

        // Add exactly enough third tracks to reach 45 total.
        const extraSlots = requiredGapSlots - minimumGapSlots;
        const shuffledGapIndexes = shuffle(Array.from({ length: gapCount }, (_, index) => index));

        for (const index of shuffledGapIndexes.slice(0, extraSlots)) {
          gapTargets[index] = 3;
        }
      }

      // Calculate the filler requirement after adjusting gap sizes.
      const requiredFillers = gaps.reduce(
        (total, gap, index) => total + gapTargets[index] - gap.length,
        0,
      );

      console.log('Playlist slot calculation:', {
        focusPlays: focusSequence.length,
        albumTracks: albumTracks.length,
        openingBuffers: openingBuffers.length,
        closingBuffers: closingBuffers.length,
        gapCount,
        gapTargets,
        albumTracksPlacedInGaps: gaps.reduce((total, gap) => total + gap.length, 0),
        requiredFillers,
        uniqueFillerPool: uniqueFillerPool.length,
      });

      if (uniqueFillerPool.length < requiredFillers) {
        throw new Error(
          `Not enough unique BTS fillers. Need ${requiredFillers}, ` +
            `but only ${uniqueFillerPool.length} eligible tracks are available. ` +
            'Please generate again.',
        );
      }

      // A designated filler occupies one distinct gap. Choose only counts
      // that fit the available gaps and the eligible unique Spotify pool.
      const availableGapIndexes = shuffle(
        gaps
          .map((gap, index) => ({ gap, index }))
          .filter(({ gap, index }) => gap.length < gapTargets[index])
          .map(({ index }) => index),
      );

      const longFillerPool = uniqueFillerPool.filter((track) => track.duration_ms >= 4 * 60 * 1000);

      const eligibleFillerCounts = fillerCountOptions.filter(
        (count) =>
          count <= requiredFillers &&
          count <= availableGapIndexes.length &&
          count <= uniqueFillerPool.length &&
          (count !== 2 || longFillerPool.length >= 2),
      );

      if (requiredFillers > 0 && eligibleFillerCounts.length === 0) {
        throw new Error(
          'Not enough separate playlist gaps or eligible BTS tracks for the automatic designated fillers. ' +
            'Please generate again.',
        );
      }

      if (eligibleFillerCounts.length > 0) {
        const selectedCount =
          eligibleFillerCounts[Math.floor(Math.random() * eligibleFillerCounts.length)];

        const designatedPool = selectedCount === 2 ? longFillerPool : uniqueFillerPool;
        selectedDesignatedFillers = shuffle(designatedPool).slice(0, selectedCount);
      }

      console.log('Automatically selected designated fillers:', {
        count: selectedDesignatedFillers.length,
        tracks: selectedDesignatedFillers.map((track) => ({
          name: track.name,
          duration: (track.duration_ms / 60000).toFixed(2) + ' min',
        })),
      });

      let fillerIndex = 0;

      // Place each designated filler in a different gap.
      for (let i = 0; i < selectedDesignatedFillers.length; i++) {
        const gapIndex = availableGapIndexes[i];
        const track = selectedDesignatedFillers[i];
        gaps[gapIndex].push(track);
        usedFillerIds.add(track.id);
        usedFillerNames.add(normalize(track.name));
      }

      // Fill all remaining slots without repeating filler tracks.
      const selectedDesignatedIds = new Set(selectedDesignatedFillers.map((track) => track.id));

      const remainingFillers = uniqueFillerPool.filter(
        (track) => !selectedDesignatedIds.has(track.id),
      );

      for (let i = 0; i < gapCount; i++) {
        while (gaps[i].length < gapTargets[i]) {
          const filler = remainingFillers[fillerIndex++];

          if (!filler) {
            throw new Error('Not enough unique BTS tracks to fill all playlist gaps.');
          }

          gaps[i].push(filler);
          usedFillerIds.add(filler.id);
          usedFillerNames.add(normalize(filler.name));
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
        ...selectedDesignatedFillers.map((track) => normalize(track.name)),
      ]);

      const excludedLowStreamIds = new Set<string>([
        ...albumTracks.map((track) => track.id),
        ...openingBuffers.map((track) => track.id),
        ...closingBuffers.map((track) => track.id),
        ...selectedDesignatedFillers.map((track) => track.id),
      ]);

      const lowStreamTracks = await this.loadLowStreamTracks(
        excludedLowStreamNames,
        excludedLowStreamIds,
      );

      // Replace two different non-focus filler slots in separate
      // sections of the main sequence; never replace album/focus tracks.
      // const protectedMainNames = new Set<string>([
      //   ...focusCounts.keys(),
      //   ...albumTracks.map((track) => normalize(track.name)),
      // ]);

      const protectedMainNames = new Set<string>([
        ...focusCounts.keys(),
        ...albumTracks.map((track) => normalize(track.name)),
        ...selectedDesignatedFillers.map((track) => normalize(track.name)),
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

      console.log(
        'Selected designated fillers:',
        selectedDesignatedFillers.map((track) => ({
          name: track.name,
          duration: (track.duration_ms / 60000).toFixed(2) + ' min',
        })),
      );

      console.log(
        'Low-stream tracks:',
        lowStreamTracks.map((track) => track.name),
      );

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

          const minGap = !hasTwoFocusSongs && albumTracks.length === 0 ? 2 : 3;

          const maxGap = !hasTwoFocusSongs && albumTracks.length === 0 ? 3 : 4;

          if (interveningTracks < minGap || interveningTracks > maxGap) {
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

      console.log('FINAL PLAYLIST DEBUG:', {
        focusPlays: focusSequence.length,
        albumTracks: albumTracks.length,
        openingBuffers: openingBuffers.length,
        closingBuffers: closingBuffers.length,
        mainTracks: mainTracks.length,
        finalTracks: finalSequence.length,
        gapTargets,
        gapLengths: gaps.map((gap) => gap.length),
      });

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
      console.error('PLAYLIST GENERATION FAILED:', error);
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

    // const results = await Promise.all(
    //   queries.map((query) => this.spotifyService.searchTracks(query)),
    // );

    const results = await Promise.all(
      queries.flatMap((query) => [
        this.spotifyService.searchTracks(query, 0),
        this.spotifyService.searchTracks(query, 10),
        this.spotifyService.searchTracks(query, 20),
      ]),
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

    console.log('Support track search results:', {
      totalUniqueTracks: uniqueTracks.size,
      excludedNames: [...excludedNames],
      candidates: uniqueTracks.size,
      trackNames: [...uniqueTracks.values()].map((track) => track.name),
    });

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
