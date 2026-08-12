interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getDuration(): number;
  getCurrentTime(): number;
  getPlaybackQuality(): string;
  setPlaybackQuality(quality: string): void;
  getAvailableQualityLevels(): string[];
  destroy(): void;
}

interface YouTubePlayerEvent {
  data: number;
}

declare namespace YT {
  const Player: {
    new (elementId: string, config: YouTubePlayerConfig): YouTubePlayer;
  };

  const PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
  };

  interface YouTubePlayerConfig {
    videoId: string;
    playerVars?: Record<string, number>;
    events?: {
      onReady?: () => void;
      onStateChange?: (event: YouTubePlayerEvent) => void;
    };
  }
}

interface Window {
  YT: {
    Player: typeof YT.Player;
    PlayerState: typeof YT.PlayerState;
  };
  onYouTubeIframeAPIReady: () => void;
  Vimeo: {
    Player: {
      new (element: HTMLIFrameElement): VimeoPlayer;
    };
  };
}

interface VimeoPlayer {
  ready(): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  setCurrentTime(seconds: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  getDuration(): Promise<number>;
  setQuality(quality: string): Promise<void>;
  getQualities(): Promise<string[]>;
  destroy(): void;
  on(event: string, callback: (data?: { seconds: number }) => void): void;
}
