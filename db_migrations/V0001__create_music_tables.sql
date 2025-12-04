-- Create tracks table for library
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  track_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration VARCHAR(20) NOT NULL,
  audio_url TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Music',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create playlist_tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id),
  track_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration VARCHAR(20) NOT NULL,
  audio_url TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create radio_stations table
CREATE TABLE IF NOT EXISTS radio_stations (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default playlists
INSERT INTO playlists (name, icon) VALUES 
  ('Favorites', 'Music'),
  ('Norwegian Black', 'Flame'),
  ('Dark Ambient', 'Moon')
ON CONFLICT DO NOTHING;

-- Insert default radio stations
INSERT INTO radio_stations (station_id, name, genre, url) VALUES 
  ('r1', 'Black Metal Radio', 'Black Metal', 'https://stream.radio.co/black-metal'),
  ('r2', 'Death Metal Station', 'Death Metal', 'https://stream.radio.co/death-metal'),
  ('r3', 'Doom Channel', 'Doom Metal', 'https://stream.radio.co/doom'),
  ('r4', 'Atmospheric Black', 'Atmospheric', 'https://stream.radio.co/atmospheric')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracks_track_id ON tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_radio_stations_station_id ON radio_stations(station_id);
