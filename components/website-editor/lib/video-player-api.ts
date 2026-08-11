export type VideoProvider = 'youtube' | 'vimeo';

export interface PlayerOptions {
  muted?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}

export interface VideoPlayerAPI {
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  getDuration(): number;
  getCurrentTime(): number;
  isPaused(): boolean;
  isMuted(): boolean;
  getQuality(): string;
  setQuality(quality: string): Promise<void>;
  getQualities(): string[];
  requestPiP(): void;
  destroy(): void;
  addEventListener(event: string, cb: (...args: unknown[]) => void): void;
  removeEventListener(event: string, cb: (...args: unknown[]) => void): void;
}

export function loadScript(src: string, id: string): Promise<void> {
  if (document.getElementById(id)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function createVideoPlayer(
  container: HTMLElement,
  provider: VideoProvider,
  videoId: string,
  options: PlayerOptions
): Promise<VideoPlayerAPI> {
  if (provider === 'youtube') {
    const { YouTubePlayerAdapter } = await import('./video-youtube-adapter');
    return new YouTubePlayerAdapter(container, videoId, options);
  }
  if (provider === 'vimeo') {
    const { VimeoPlayerAdapter } = await import('./video-vimeo-adapter');
    return new VimeoPlayerAdapter(container, videoId, options);
  }
  throw new Error(`Unknown provider: ${provider}`);
}
