import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Coffee, Brain, Waves } from 'lucide-react';

interface MusicControlsProps {
  sessionType: 'focus' | 'break';
  isTimerRunning?: boolean;
}

const playlists = {
  focus: {
    'lo-fi': {
      name: 'Lo-Fi Beats',
      icon: Waves,
      description: 'Chill beats for deep focus',
      color: 'bg-gradient-primary'
    },
    'classical': {
      name: 'Classical Focus',
      icon: Music,
      description: 'Classical music for concentration',
      color: 'bg-gradient-accent'
    },
    'ambient': {
      name: 'Ambient Sounds',
      icon: Brain,
      description: 'Nature and ambient sounds',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    'binaural': {
      name: 'Binaural Beats',
      icon: Brain,
      description: 'Brainwave entrainment',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  },
  break: {
    'upbeat': {
      name: 'Energizing',
      icon: Coffee,
      description: 'Upbeat music for breaks',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    'chill': {
      name: 'Chill Vibes',
      icon: Waves,
      description: 'Relaxing break music',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    'nature': {
      name: 'Nature Sounds',
      icon: Brain,
      description: 'Natural ambience',
      color: 'bg-gradient-to-r from-green-400 to-emerald-400'
    }
  }
};

export const MusicControls = ({ sessionType, isTimerRunning }: MusicControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<string>(sessionType === 'focus' ? 'lo-fi' : 'upbeat');
  const [volume, setVolume] = useState([70]);
  const [currentTrack, setCurrentTrack] = useState('Focus Session 01');
  const [duration, setDuration] = useState([0]);
  const [currentTime, setCurrentTime] = useState([0]);

  const currentPlaylists = playlists[sessionType];

  // Auto-switch playlist based on session type
  useEffect(() => {
    if (sessionType === 'focus' && !Object.keys(playlists.focus).includes(currentPlaylist)) {
      setCurrentPlaylist('lo-fi');
    } else if (sessionType === 'break' && !Object.keys(playlists.break).includes(currentPlaylist)) {
      setCurrentPlaylist('upbeat');
    }
  }, [sessionType, currentPlaylist]);

  // Auto-pause/resume with timer
  useEffect(() => {
    if (isTimerRunning && !isPlaying) {
      // Optional: Auto-start music when timer starts
    } else if (!isTimerRunning && isPlaying) {
      // Optional: Auto-pause music when timer stops
    }
  }, [isTimerRunning, isPlaying]);

  // Simulate track progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev[0] >= duration[0]) {
            // Track ended, skip to next
            setCurrentTrack(`${sessionType === 'focus' ? 'Focus' : 'Break'} Session ${Math.floor(Math.random() * 20) + 1}`);
            setDuration([Math.floor(Math.random() * 300) + 180]); // 3-8 minutes
            return [0];
          }
          return [prev[0] + 1];
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration, sessionType]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && duration[0] === 0) {
      // Start new track
      setDuration([Math.floor(Math.random() * 300) + 180]);
      setCurrentTime([0]);
    }
  };

  const skipTrack = (direction: 'forward' | 'back') => {
    setCurrentTrack(`${sessionType === 'focus' ? 'Focus' : 'Break'} Session ${Math.floor(Math.random() * 20) + 1}`);
    setDuration([Math.floor(Math.random() * 300) + 180]);
    setCurrentTime([0]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSelectedPlaylist = () => {
    if (sessionType === 'focus') {
      return playlists.focus[currentPlaylist as keyof typeof playlists.focus] || playlists.focus['lo-fi'];
    } else {
      return playlists.break[currentPlaylist as keyof typeof playlists.break] || playlists.break['upbeat'];
    }
  };
  
  const selectedPlaylist = getSelectedPlaylist();
  const PlaylistIcon = selectedPlaylist.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Music className="h-6 w-6" />
          Music
        </h2>
        <Badge variant={sessionType === 'focus' ? 'default' : 'secondary'}>
          {sessionType === 'focus' ? '🎯 Focus Mode' : '☕ Break Mode'}
        </Badge>
      </div>

      {/* Playlist Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block">Choose Playlist</label>
        <Select value={currentPlaylist} onValueChange={setCurrentPlaylist}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currentPlaylists).map(([key, playlist]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <playlist.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{playlist.name}</div>
                    <div className="text-xs text-muted-foreground">{playlist.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Now Playing */}
      <div className="mb-6">
        <div className={`rounded-lg p-4 mb-4 ${selectedPlaylist?.color || 'bg-gradient-primary'} text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <PlaylistIcon className="h-6 w-6" />
            <div>
              <div className="font-medium">{selectedPlaylist?.name}</div>
              <div className="text-sm opacity-90">{currentTrack}</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1 opacity-90">
              <span>{formatTime(currentTime[0])}</span>
              <span>{formatTime(duration[0])}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-1000"
                style={{ width: duration[0] > 0 ? `${(currentTime[0] / duration[0]) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => skipTrack('back')}>
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button 
          size="lg" 
          onClick={togglePlayback}
          className="min-w-16"
          variant={sessionType === 'focus' ? 'default' : 'secondary'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => skipTrack('forward')}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm font-medium">Volume</span>
        </div>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground text-center">
          {volume[0]}%
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        Music adapts automatically to your session type
      </div>
    </Card>
  );
};