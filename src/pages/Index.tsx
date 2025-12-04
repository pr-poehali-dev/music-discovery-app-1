import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useToast } from "@/hooks/use-toast";
import AudioVisualizer from "@/components/AudioVisualizer";
import MiniVisualizer from "@/components/MiniVisualizer";
import { api } from "@/lib/api";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  album?: string;
  audioUrl?: string;
}

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  url: string;
}

const Index = () => {
  const { toast } = useToast();
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    playTrack,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    formatTime,
    audioElement,
  } = useAudioPlayer();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const queryClient = useQueryClient();

  const { data: libraryTracks = [], refetch: refetchLibrary } = useQuery({
    queryKey: ['library'],
    queryFn: api.getLibrary,
  });

  const { data: playlists = [], refetch: refetchPlaylists } = useQuery({
    queryKey: ['playlists'],
    queryFn: api.getPlaylists,
  });

  const { data: radioStations = [], refetch: refetchRadio } = useQuery({
    queryKey: ['radio'],
    queryFn: api.getRadioStations,
  });

  const addToLibraryMutation = useMutation({
    mutationFn: api.addToLibrary,
    onSuccess: () => {
      refetchLibrary();
    },
  });

  const mockTracks: Track[] = [
    { id: "1", title: "Funeral Fog", artist: "Mayhem", duration: "5:47", album: "De Mysteriis Dom Sathanas", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "2", title: "Freezing Moon", artist: "Mayhem", duration: "6:23", album: "De Mysteriis Dom Sathanas", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "3", title: "Transilvanian Hunger", artist: "Darkthrone", duration: "6:09", album: "Transilvanian Hunger", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "4", title: "Under a Funeral Moon", artist: "Darkthrone", duration: "5:07", album: "Under a Funeral Moon", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { id: "5", title: "In the Shadow of the Horns", artist: "Darkthrone", duration: "7:07", album: "A Blaze in the Northern Sky", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { id: "6", title: "Dunkelheit", artist: "Burzum", duration: "7:05", album: "Filosofem", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { id: "7", title: "Det Som Engang Var", artist: "Burzum", duration: "14:21", album: "Det Som Engang Var", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { id: "8", title: "Pure Fucking Armageddon", artist: "Mayhem", duration: "3:30", album: "Pure Fucking Armageddon", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  ];

  const myLibrary = libraryTracks.map(t => ({
    id: t.track_id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    audioUrl: t.audio_url,
  }));

  const dbRadioStations = radioStations.map(s => ({
    id: s.station_id,
    name: s.name,
    genre: s.genre,
    url: s.url,
  }));

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
    toast({
      title: "Сейчас играет",
      description: `${track.title} - ${track.artist}`,
    });
  };

  const handleDownload = async (track: Track) => {
    try {
      await addToLibraryMutation.mutateAsync({
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        audio_url: track.audioUrl,
      });
      toast({
        title: "Загрузка",
        description: `${track.title} добавлен в библиотеку`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить трек",
        variant: "destructive",
      });
    }
  };

  const filteredTracks = mockTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 chain-pattern">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⛓️</div>
            <h1 className="text-3xl font-bold metal-text">INFERNAL SOUND</h1>
            <div className="text-3xl">⛓️</div>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Skull" size={28} className="text-primary" />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-32">
        {currentTrack && (
          <Card className="mb-6 bg-card/80 border-primary/30 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[150px] bg-gradient-to-b from-secondary/50 to-background">
                <AudioVisualizer isPlaying={isPlaying} audioElement={audioElement} />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/80 mb-6">
            <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Search" size={18} className="mr-2" />
              ПОИСК
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Library" size={18} className="mr-2" />
              БИБЛИОТЕКА
            </TabsTrigger>
            <TabsTrigger value="radio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Radio" size={18} className="mr-2" />
              РАДИО
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="ListMusic" size={18} className="mr-2" />
              ПЛЕЙЛИСТЫ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск треков, исполнителей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <Card key={track.id} className="bg-card/80 border-border hover:bg-card transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePlayTrack(track)}
                          className="hover:bg-primary/20"
                        >
                          <Icon name={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"} size={20} className="text-primary" />
                        </Button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{track.duration}</span>
                        <Button size="icon" variant="ghost" className="hover:bg-primary/20" onClick={() => handleDownload(track)}>
                          <Icon name="Download" size={18} className="text-primary" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold blood-glow">МОЯ МУЗЫКА</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="HardDrive" size={20} />
                <span className="text-sm">{myLibrary.length} треков</span>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {myLibrary.map((track) => (
                  <Card key={track.id} className="bg-card/80 border-border hover:bg-card transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePlayTrack(track)}
                          className="hover:bg-primary/20"
                        >
                          <Icon name={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"} size={20} className="text-primary" />
                        </Button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.artist} • {track.album}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{track.duration}</span>
                        <Button size="icon" variant="ghost" className="hover:bg-primary/20" onClick={() => toast({ title: "Удалено", description: `${track.title} удален из библиотеки` })}>
                          <Icon name="Trash2" size={18} className="text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="radio" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold blood-glow">ОНЛАЙН РАДИО</h2>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Icon name="Plus" size={18} className="mr-2" />
                ДОБАВИТЬ СТАНЦИЮ
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="grid gap-4 md:grid-cols-2">
                {dbRadioStations.map((station) => (
                  <Card key={station.id} className="bg-card/80 border-border hover:bg-card transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-1">{station.name}</h3>
                          <p className="text-sm text-muted-foreground">{station.genre}</p>
                        </div>
                        <Icon name="Radio" size={24} className="text-primary" />
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
                        onClick={() => {
                          playTrack({ id: station.id, title: station.name, artist: station.genre, duration: "∞" });
                          toast({ title: "Радио", description: `Слушаем ${station.name}` });
                        }}
                      >
                        <Icon name="Play" size={18} className="mr-2" />
                        СЛУШАТЬ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold blood-glow">МОИ ПЛЕЙЛИСТЫ</h2>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Icon name="Plus" size={18} className="mr-2" />
                СОЗДАТЬ
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-card/80 border-border hover:bg-card transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-full aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center">
                      <Icon name={playlist.icon as any} size={48} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlist.track_count || 0} треков</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-sm chain-pattern">
        <div className="container mx-auto px-4 py-4">
          {currentTrack ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <MiniVisualizer isPlaying={isPlaying} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{currentTrack.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="hover:bg-primary/20" onClick={skipBackward}>
                    <Icon name="SkipBack" size={20} className="text-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-primary hover:bg-primary/80 text-primary-foreground w-12 h-12"
                    onClick={togglePlay}
                  >
                    <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-primary/20" onClick={skipForward}>
                    <Icon name="SkipForward" size={20} className="text-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-primary/20">
                    <Icon name="Repeat" size={20} className="text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-primary/20">
                    <Icon name="Shuffle" size={20} className="text-muted-foreground" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 w-32">
                  <Icon name="Volume2" size={20} className="text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={(val) => setVolume(val[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                <Slider 
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]} 
                  max={100} 
                  className="flex-1"
                  onValueChange={(val) => seek((val[0] / 100) * duration)}
                />
                <span className="text-xs text-muted-foreground">{duration > 0 ? formatTime(duration) : currentTrack.duration}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p className="flex items-center justify-center gap-2">
                <Icon name="Music" size={20} />
                Выберите трек для воспроизведения
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;