import { ChangeDetectorRef, Component, Input, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpotifyService, SpotifyTrack, SpotifyPlaylist } from '../services/spotify.service';

@Component({
  selector: 'app-spotify-playlist-setup',
  imports: [FormsModule],
  templateUrl: './spotify-playlist-setup.html',
  styleUrl: './spotify-playlist-setup.scss',
})
export class SpotifyPlaylistSetup implements OnInit {
  private spotifyService = inject(SpotifyService);
  private cdr = inject(ChangeDetectorRef);

  @Input() tracks: string[] = [];

  playlistTitle = 'HEARTBEAT 💜';
  playlistDescription = '';

  selectedCoverOption: 'upload' | 'generated' = 'generated';
  selectedTheme = 'lavender';

  coverFile: File | null = null;
  coverPreviewUrl = '';

  // Spotify connection
  spotifyConnected = false;

  // Playlist creation
  isCreatingSpotifyPlaylist = false;
  createdSpotifyPlaylist: SpotifyPlaylist | null = null;
  spotifyPlaylistError = '';

  themes = [
    { name: 'Lavender', value: 'lavender' },
    { name: 'Midnight', value: 'midnight' },
    { name: 'Ocean', value: 'ocean' },
  ];

  ngOnInit(): void {
    this.checkSpotifyConnection();
  }

  connectSpotify(): void {
    this.spotifyService.login();
  }

  checkSpotifyConnection(): void {
    this.spotifyConnected = this.spotifyService.isConnected();
    this.cdr.markForCheck();
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.coverFile = file;
      this.coverPreviewUrl = URL.createObjectURL(file);
    }
  }

  private normalizeTrackName(name: string): string {
    return name.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }

  async createSpotifyPlaylist(): Promise<void> {
    if (this.isCreatingSpotifyPlaylist) return;

    if (!this.spotifyConnected) {
      this.spotifyPlaylistError = 'Connect to Spotify first.';
      return;
    }

    if (this.tracks.length === 0) {
      this.spotifyPlaylistError = 'Generate a playlist first.';
      return;
    }

    if (!this.playlistTitle.trim()) {
      this.spotifyPlaylistError = 'Enter a playlist title.';
      return;
    }

    this.isCreatingSpotifyPlaylist = true;
    this.spotifyPlaylistError = '';
    this.createdSpotifyPlaylist = null;
    this.cdr.markForCheck();

    try {
      const trackCache = new Map<string, SpotifyTrack>();

      // Resolve each preview title to an exact Spotify track.
      for (const title of this.tracks) {
        const key = this.normalizeTrackName(title);

        if (trackCache.has(key)) continue;

        // First, try the normal Spotify search.
        let results = await this.spotifyService.searchTracks(title);

        let exactMatch = results.find((track) => this.normalizeTrackName(track.name) === key);

        // If not found, try a title-specific Spotify search.
        if (!exactMatch) {
          results = await this.spotifyService.searchTracks(`track:"${title.replace(/"/g, '\\"')}"`);

          exactMatch = results.find((track) => this.normalizeTrackName(track.name) === key);
        }

        // Do not accept an approximate match.
        if (!exactMatch) {
          console.error(`Spotify search failed for: ${title}`);

          throw new Error(`Could not find an exact Spotify match for "${title}".`);
        }

        trackCache.set(key, exactMatch);
      }

      // Preserve original order and repeated plays.
      const trackIds = this.tracks.map(
        (title) => trackCache.get(this.normalizeTrackName(title))!.id,
      );

      const playlist = await this.spotifyService.createPlaylist(
        this.playlistTitle.trim(),
        this.playlistDescription.trim() || 'A BTS-focused playlist generated with HEARTBEAT.',
      );

      await this.spotifyService.addTracksToPlaylist(playlist.id, trackIds);

      // Keep the created playlist available even if cover upload fails.
      this.createdSpotifyPlaylist = playlist;

      // Prepare the selected cover.
      let imageBase64: string;

      if (this.selectedCoverOption === 'upload') {
        if (!this.coverFile) {
          throw new Error('Please select an image for your playlist cover.');
        }

        imageBase64 = await this.prepareUploadedCover(this.coverFile);
      } else {
        imageBase64 = await this.prepareGeneratedCover();
      }

      // Upload the cover to Spotify.
      await this.spotifyService.uploadPlaylistCover(playlist.id, imageBase64);
    } catch (error) {
      this.spotifyPlaylistError =
        error instanceof Error ? error.message : 'Could not create your Spotify playlist.';
    } finally {
      this.isCreatingSpotifyPlaylist = false;
      this.cdr.markForCheck();
    }
  }

  // private async prepareUploadedCover(file: File): Promise<string> {
  //   const image = await createImageBitmap(file);

  //   const maxDimension = 640;
  //   const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

  //   const canvas = document.createElement('canvas');
  //   canvas.width = Math.round(image.width * scale);
  //   canvas.height = Math.round(image.height * scale);

  //   const context = canvas.getContext('2d');

  //   if (!context) {
  //     image.close();
  //     throw new Error('Could not prepare your cover image.');
  //   }

  //   context.fillStyle = '#ffffff';
  //   context.fillRect(0, 0, canvas.width, canvas.height);
  //   context.drawImage(image, 0, 0, canvas.width, canvas.height);
  //   image.close();

  //   let blob: Blob | null = null;

  //   for (let quality = 0.9; quality >= 0.3; quality -= 0.1) {
  //     blob = await new Promise<Blob | null>((resolve) =>
  //       canvas.toBlob(resolve, 'image/jpeg', quality),
  //     );

  //     if (blob && blob.size <= 256 * 1024) {
  //       break;
  //     }
  //   }

  //   if (!blob || blob.size > 256 * 1024) {
  //     throw new Error('Your cover image could not be compressed below 256 KB.');
  //   }

  //   return await new Promise<string>((resolve, reject) => {
  //     const reader = new FileReader();

  //     reader.onload = () => {
  //       const result = reader.result as string;
  //       resolve(result.split(',')[1]);
  //     };

  //     reader.onerror = () => reject(new Error('Could not read your cover image.'));

  //     reader.readAsDataURL(blob);
  //   });
  // }

  private async prepareUploadedCover(file: File): Promise<string> {
    const image = await createImageBitmap(file);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;

    const context = canvas.getContext('2d');

    if (!context) {
      image.close();
      throw new Error('Could not prepare your cover image.');
    }

    // Crop the image to a square, keeping its centre.
    const scale = Math.max(640 / image.width, 640 / image.height);

    const width = image.width * scale;
    const height = image.height * scale;

    const x = (640 - width) / 2;
    const y = (640 - height) / 2;

    context.drawImage(image, x, y, width, height);
    image.close();

    // Subtle dark overlay to keep the title readable.
    const overlay = context.createLinearGradient(0, 0, 0, 640);
    overlay.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
    overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0.28)');
    overlay.addColorStop(1, 'rgba(0, 0, 0, 0.08)');

    context.fillStyle = overlay;
    context.fillRect(0, 0, 640, 640);

    // Playlist title.
    const title = this.playlistTitle.trim() || 'HEARTBEAT';

    let fontSize = 44;
    let lines: string[] = [];

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Wrap the title into readable lines.
    const wrapTitle = (font: string): string[] => {
      context.font = font;

      const result: string[] = [];
      let currentLine = '';

      for (const word of title.split(/\s+/)) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (context.measureText(testLine).width > 520 && currentLine) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        result.push(currentLine);
      }

      return result;
    };

    lines = wrapTitle(`bold ${fontSize}px Arial`);

    // Reduce font size if the title needs several lines.
    while (lines.length > 3 && fontSize > 28) {
      fontSize -= 2;
      lines = wrapTitle(`bold ${fontSize}px Arial`);
    }

    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = '#ffffff';
    context.shadowColor = 'rgba(0, 0, 0, 0.65)';
    context.shadowBlur = 12;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 3;

    const lineHeight = fontSize * 1.25;
    const startY = 320 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      context.fillText(line, 320, startY + index * lineHeight, 540);
    });

    context.shadowColor = 'transparent';
    context.shadowBlur = 0;

    // Compress to Spotify's image-size limit.
    let blob: Blob | null = null;

    for (let quality = 0.9; quality >= 0.3; quality -= 0.1) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality),
      );

      if (blob && blob.size <= 256 * 1024) {
        break;
      }
    }

    if (!blob || blob.size > 256 * 1024) {
      throw new Error('Your cover image could not be compressed below 256 KB.');
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };

      reader.onerror = () => reject(new Error('Could not prepare your cover image.'));

      reader.readAsDataURL(blob);
    });
  }

  private async prepareGeneratedCover(): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create your HEARTBEAT cover.');
    }

    // Theme colours
    const themes: Record<string, [string, string]> = {
      lavender: ['#30204f', '#b99adf'],
      midnight: ['#080d24', '#424b78'],
      ocean: ['#063b52', '#55b9c5'],
    };

    const [startColor, endColor] = themes[this.selectedTheme] ?? themes['lavender'];

    // Background gradient
    const gradient = context.createLinearGradient(0, 0, 640, 640);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    context.fillStyle = gradient;
    context.fillRect(0, 0, 640, 640);

    // Decorative circles
    context.globalAlpha = 0.12;
    context.fillStyle = '#ffffff';

    context.beginPath();
    context.arc(80, 90, 150, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(590, 570, 190, 0, Math.PI * 2);
    context.fill();

    context.globalAlpha = 1;

    // Heart decoration
    context.fillStyle = '#ffffff';
    context.font = '90px Georgia';
    context.textAlign = 'center';
    context.fillText('♡', 320, 190);

    // Playlist title
    const title = this.playlistTitle.trim() || 'HEARTBEAT';
    const words = title.split(/\s+/);

    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';

    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (context.measureText(testLine).width > 520 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);

    const lineHeight = 62;
    const startY = 320 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      context.fillText(line, 320, startY + index * lineHeight);
    });

    // HEARTBEAT signature
    context.font = '22px Arial';
    context.globalAlpha = 0.85;
    // context.fillText('A HEARTBEAT PLAYLIST', 320, 520);
    context.globalAlpha = 1;

    // Compress to Spotify's image-size limit
    let blob: Blob | null = null;

    for (let quality = 0.9; quality >= 0.3; quality -= 0.1) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality),
      );

      if (blob && blob.size <= 256 * 1024) break;
    }

    if (!blob || blob.size > 256 * 1024) {
      throw new Error('Could not compress your HEARTBEAT cover.');
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };

      reader.onerror = () => reject(new Error('Could not prepare your HEARTBEAT cover.'));

      reader.readAsDataURL(blob);
    });
  }
}
