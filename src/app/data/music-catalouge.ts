
export interface Album {
  title: string;
  artist: string;
  tracks: string[];
}

export const ALBUM_CATALOGUE: Album[] = [
  {
    title: 'ARIRANG',
    artist: 'BTS',
    tracks: [
      'Body to Body',
      'Hooligan',
      'Aliens',
      'FYA',
      '2.0',
      'No. 29',
      'SWIM',
      'Merry Go Round',
      'NORMAL',
      'Like Animals',
      "they don't know 'bout us",
      'One More Night',
      'Please',
      'Into the Sun',
    ],
  },
  {
    title: 'KEEP SWIMMING',
    artist: 'BTS',
    tracks: [
      'SWIM',
      'SWIM with RM (Chill Hip Hop Remix)',
      'SWIM with Jin (Alternative Rock Remix)',
      'SWIM with SUGA (Melodic Techno Remix)',
      'SWIM with j-hope (Afrobeat Remix)',
      'SWIM with Jimin (Slow Jam R&B Remix)',
      'SWIM with V (Electronic Remix)',
      'SWIM with Jung Kook (Acoustic Lofi Remix)',
      'SWIM (Instrumental)',
    ],
  },
];


export const TRACK_CATALOGUE: string[] = [
  'SWIM',
  "Killin' It Girl (feat. GloRilla)",
  'Wild Flower (with youjeen)',
  'Haegeum',
  "Don't Say You Love Me",
  'Come Over',
];