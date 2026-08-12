import type { VideoPlayerAPI, PlayerOptions } from './video-player-api';

const VIMEO_API_SRC = 'https://player.vimeo.com/api/player.js';
let vimeoApiReady: Promise<void> | null = null;

function loadVimeo(): Promise<void> {
  if (vimeoApiReady) return vimeoApiReady;
  if (window.Vimeo?.Player) {
    vimeoApiReady = Promise.resolve();
    return vimeoApiReady;
  }
  vimeoApiReady = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = VIMEO_API_SRC;
    script.onload = () => resolve();
    script.onerror = () => { vimeoApiReady = null; };
    document.head.appendChild(script);
  });
  return vimeoApiReady;
}

export class VimeoPlayerAdapter implements VideoPlayerAPI {
  private player: VimeoPlayer | null = null;
  private container: HTMLElement;
  private videoId: string;
  private options: PlayerOptions;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private _currentTime = 0;
  private _duration = 0;
  private _paused = true;
  private _muted = false;
  private _qualities: string[] = [];

  constructor(container: HTMLElement, videoId: string, options: PlayerOptions) {
    this.container = container;
    this.videoId = videoId;
    this.options = options;
  }

  async init(): Promise<void> {
    await loadVimeo();
    const Vimeo = window.Vimeo;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
    iframe.src = `https://player.vimeo.com/video/${this.videoId}?controls=0&title=0&byline=0&portrait=0`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    this.container.appendChild(iframe);

    return new Promise((resolve) => {
      this.player = new Vimeo.Player(iframe);
      const p = this.player;
      p.ready().then(() => {
        p.getDuration().then((d: number) => { this._duration = d; });
        if (this.options.muted) p.setMuted(true);
        if (this.options.autoplay) this.play();

        p.on('play', () => { this._paused = false; this.emit('statechange', 'playing'); });
        p.on('pause', () => { this._paused = true; this.emit('statechange', 'paused'); });
        p.on('ended', () => { this._paused = true; this.emit('statechange', 'ended'); });
        p.on('bufferstart', () => { this.emit('statechange', 'buffering'); });
        p.on('bufferend', () => { this.emit('statechange', this._paused ? 'paused' : 'playing'); });
        p.on('timeupdate', (d?: { seconds: number }) => {
          if (d) {
            this._currentTime = d.seconds;
            this.emit('timeupdate', d.seconds);
          }
        });
        p.getQualities().then((q: string[]) => { this._qualities = q; }).catch(() => {});
        resolve();
      });
    });
  }

  play() { this.player?.play(); this._paused = false; }
  pause() { this.player?.pause(); this._paused = true; }
  seekTo(seconds: number) { this.player?.setCurrentTime(seconds); }
  setVolume(volume: number) { this.player?.setVolume(volume / 100); }
  mute() { this.player?.setMuted(true); this._muted = true; }
  unmute() { this.player?.setMuted(false); this._muted = false; }
  getDuration() { return this._duration; }
  getCurrentTime() { return this._currentTime; }
  isPaused() { return this._paused; }
  isMuted() { return this._muted; }
  getQuality() { return 'auto'; }
  async setQuality(quality: string) { try { await this.player?.setQuality(quality); } catch { /* ignore */ } }
  getQualities(): string[] { return this._qualities; }
  requestPiP() {
    const iframe = this.container.querySelector('iframe');
    if (iframe && document.pictureInPictureEnabled) {
      (iframe as { requestPictureInPicture?: () => Promise<void> }).requestPictureInPicture?.();
    }
  }
  destroy() {
    this.player?.destroy();
    this.player = null;
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
