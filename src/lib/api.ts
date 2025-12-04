const API_URL = 'https://functions.poehali.dev/bb41e221-d5f8-4186-bff4-4decf774025d';

export interface Track {
  id?: number;
  track_id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  audio_url?: string;
  added_at?: string;
}

export interface Playlist {
  id: number;
  name: string;
  icon: string;
  track_count?: number;
  created_at?: string;
}

export interface RadioStation {
  id?: number;
  station_id: string;
  name: string;
  genre: string;
  url: string;
  created_at?: string;
}

export const api = {
  async getLibrary(): Promise<Track[]> {
    const response = await fetch(`${API_URL}?action=library`);
    if (!response.ok) throw new Error('Failed to fetch library');
    return response.json();
  },

  async addToLibrary(track: Omit<Track, 'id' | 'added_at'>): Promise<void> {
    const response = await fetch(`${API_URL}?action=library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: track.track_id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        audioUrl: track.audio_url,
      }),
    });
    if (!response.ok) throw new Error('Failed to add track');
  },

  async getPlaylists(): Promise<Playlist[]> {
    const response = await fetch(`${API_URL}?action=playlists`);
    if (!response.ok) throw new Error('Failed to fetch playlists');
    return response.json();
  },

  async createPlaylist(name: string, icon: string = 'Music'): Promise<void> {
    const response = await fetch(`${API_URL}?action=playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon }),
    });
    if (!response.ok) throw new Error('Failed to create playlist');
  },

  async getRadioStations(): Promise<RadioStation[]> {
    const response = await fetch(`${API_URL}?action=radio`);
    if (!response.ok) throw new Error('Failed to fetch radio stations');
    return response.json();
  },

  async addRadioStation(station: Omit<RadioStation, 'id' | 'created_at'>): Promise<void> {
    const response = await fetch(`${API_URL}?action=radio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: station.station_id,
        name: station.name,
        genre: station.genre,
        url: station.url,
      }),
    });
    if (!response.ok) throw new Error('Failed to add radio station');
  },
};
