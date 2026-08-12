import type { VideoPlayerAPI, PlayerOptions } from './video-player-api';

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
let ytApiReady: Promise<void> | null = null;

function loadYT(): Promise<void> {
  if (ytApiReady) return ytApiReady;
  if (window.YT?.Player) {
    ytApiReady = Promise.resolve();
    return ytApiReady;
  }
  ytApiReady = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement('script');
    script.src = YT_API_SRC;
    document.head.appendChild(script);
  });
  return ytApiReady;
}

export class YouTubePlayerAdapter implements VideoPlayerAPI {
  private player: YouTubePlayer | null = null;
  private container: HTMLElement;
  private videoId: string;
  private options: PlayerOptions;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private statePoll: number | null = null;
  private _currentTime = 0;
  private _duration = 0;
  private _state: 'playing' | 'paused' | 'ended' | 'buffering' = 'paused';
  private ready = false;

  constructor(container: HTMLElement, videoId: string, options: PlayerOptions) {
    this.container = container;
    this.videoId = videoId;
    this.options = options;
  }

  async init(): Promise<void> {
    await loadYT();
    const playerId = `yt-player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const div = document.createElement('div');
    div.id = playerId;
    div.style.cssText = 'position:absolute;top:-17%;left:0;width:100%;height:134%;';
    this.container.appendChild(div);

    return new Promise((resolve) => {
      this.player = new window.YT.Player(playerId, {
        videoId: this.videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1, iv_load_policy: 3, cc_load_policy: 0, showinfo: 0, disablekb: 1, fs: 0 },
        events: {
          onReady: () => {
            const p = this.player!;
            this._duration = p.getDuration() || 0;
            this.ready = true;
            if (this.options.muted) p.mute();
            if (this.options.autoplay) this.play();
            this.startPolling();
            resolve();
          },
          onStateChange: (e: YouTubePlayerEvent) => {
            const stateMap: Record<number, 'playing' | 'paused' | 'ended' | 'buffering'> = {
              [YT.PlayerState.PLAYING]: 'playing',
              [YT.PlayerState.PAUSED]: 'paused',
              [YT.PlayerState.ENDED]: 'ended',
              [YT.PlayerState.BUFFERING]: 'buffering',
            };
            this._state = stateMap[e.data] || 'paused';
            this.emit('statechange', this._state);
          },
        },
      });
    });
  }

  private startPolling() {
    const poll = () => {
      if (!this.ready || !this.player) return;
      try {
        const t = this.player.getCurrentTime();
        if (t !== this._currentTime) {
          this._currentTime = t;
          this.emit('timeupdate', t);
        }
      } catch { /* ignore */ }
      this.statePoll = requestAnimationFrame(poll);
    };
    this.statePoll = requestAnimationFrame(poll);
  }

  play() { this.player?.playVideo(); }
  pause() { this.player?.pauseVideo(); }
  seekTo(seconds: number) { this.player?.seekTo(seconds, true); }
  setVolume(volume: number) { this.player?.setVolume(volume); }
  mute() { this.player?.mute(); }
  unmute() { this.player?.unMute(); }
  getDuration() { return this._duration; }
  getCurrentTime() { return this._currentTime; }
  isPaused() { return this._state !== 'playing'; }
  isMuted() { return this.player?.isMuted() || false; }
  getQuality() { return this.player?.getPlaybackQuality() || 'auto'; }
  async setQuality(quality: string) { this.player?.setPlaybackQuality(quality); }
  getQualities(): string[] { return this.player?.getAvailableQualityLevels() || ['auto']; }
  requestPiP() {
    const iframe = this.container.querySelector('iframe');
    if (iframe && document.pictureInPictureEnabled) {
      (iframe as { requestPictureInPicture?: () => Promise<void> }).requestPictureInPicture?.();
    }
  }
  destroy() {
    if (this.statePoll) cancelAnimationFrame(this.statePoll);
    this.player?.destroy();
    this.player = null;
    this.ready = false;
  }
  addEventListener(event: string, cb: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }
  removeEventListener(event: string, cb: (...args: unknown[]) => void) {
    this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }
}
