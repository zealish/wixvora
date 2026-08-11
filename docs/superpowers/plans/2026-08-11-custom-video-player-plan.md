# Custom Video Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom video player with branded controls (play, seek, volume, quality, PiP, fullscreen) layered on YouTube/Vimeo iframes with `controls=0`.

**Architecture:** Adapter pattern — unified `VideoPlayerAPI` interface with `YouTubePlayerAdapter` and `VimeoPlayerAdapter` implementations. React `VideoPlayer` component in canvas; vanilla JS `initVideoPlayer` for exported HTML.

**Tech Stack:** React, TypeScript, Tailwind CSS, YouTube IFrame API, Vimeo Player.js. Zero new npm dependencies.

## Global Constraints

- Zero new npm dependencies
- Backward compatible — all existing video props preserved unchanged
- TypeScript strict — no `any` casts in new code
- Export HTML must be self-contained (no external JS dependencies)
- `controls=0` on all embedded iframes to hide native YouTube/Vimeo UI

---

### Task 1: Add new Element props and defaults

**Files:**
- Modify: `components/website-editor/lib/block-types.ts:64-67`
- Modify: `components/website-editor/lib/element-presets.ts:148-152`

**Interfaces:**
- Produces: `Element.muted?: boolean`, `Element.showControls?: boolean`, `Element.controlBarTheme?: 'dark' | 'light'`

- [ ] **Step 1: Add props to Element interface**

Edit `block-types.ts`, add after `overlayColor?: string;` (line 67):
```typescript
muted?: boolean;
showControls?: boolean;
controlBarTheme?: 'dark' | 'light';
```

- [ ] **Step 2: Add defaults to video preset**

Edit `element-presets.ts`, add after `overlayColor: 'rgba(0,0,0,0.3)',` (line 152):
```typescript
muted: false,
showControls: true,
controlBarTheme: 'dark',
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/lib/block-types.ts components/website-editor/lib/element-presets.ts
git commit -m "feat: add muted, showControls, controlBarTheme props to video element"
```

---

### Task 2: Create VideoPlayerAPI interface and factory

**Files:**
- Create: `components/website-editor/lib/video-player-api.ts`

**Interfaces:**
- Produces: `VideoPlayerAPI` (interface), `PlayerOptions` (type), `createVideoPlayer()` function, `loadScript()` helper

- [ ] **Step 1: Create video-player-api.ts**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/video-player-api.ts
git commit -m "feat: create VideoPlayerAPI interface and factory"
```

---

### Task 3: Create YouTube adapter

**Files:**
- Create: `components/website-editor/lib/video-youtube-adapter.ts`

**Interfaces:**
- Consumes: `VideoPlayerAPI`, `PlayerOptions` from Task 2
- Produces: `YouTubePlayerAdapter` class implementing `VideoPlayerAPI`

- [ ] **Step 1: Create YouTube adapter**

```typescript
import type { VideoPlayerAPI, PlayerOptions } from './video-player-api';

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
let ytApiReady: Promise<void> | null = null;

function loadYT(): Promise<void> {
  if (ytApiReady) return ytApiReady;
  if ((window as any).YT?.Player) {
    ytApiReady = Promise.resolve();
    return ytApiReady;
  }
  ytApiReady = new Promise((resolve) => {
    (window as any).onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement('script');
    script.src = YT_API_SRC;
    document.head.appendChild(script);
  });
  return ytApiReady;
}

export class YouTubePlayerAdapter implements VideoPlayerAPI {
  private player: any = null;
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
    this.container.innerHTML = '';
    this.container.appendChild(div);

    return new Promise((resolve) => {
      this.player = new (window as any).YT.Player(playerId, {
        videoId: this.videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            this._duration = this.player.getDuration() || 0;
            this.ready = true;
            if (this.options.muted) this.player.mute();
            if (this.options.autoplay) this.play();
            this.startPolling();
            resolve();
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
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
      iframe.requestPictureInPicture?.();
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/video-youtube-adapter.ts
git commit -m "feat: create YouTube player adapter"
```

---

### Task 4: Create Vimeo adapter

**Files:**
- Create: `components/website-editor/lib/video-vimeo-adapter.ts`

**Interfaces:**
- Consumes: `VideoPlayerAPI`, `PlayerOptions` from Task 2
- Produces: `VimeoPlayerAdapter` class implementing `VideoPlayerAPI`

- [ ] **Step 1: Create Vimeo adapter**

```typescript
import type { VideoPlayerAPI, PlayerOptions } from './video-player-api';

const VIMEO_API_SRC = 'https://player.vimeo.com/api/player.js';
let vimeoApiReady: Promise<void> | null = null;

function loadVimeo(): Promise<void> {
  if (vimeoApiReady) return vimeoApiReady;
  if ((window as any).Vimeo?.Player) {
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
  private player: any = null;
  private container: HTMLElement;
  private videoId: string;
  private options: PlayerOptions;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private statePoll: number | null = null;
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
    const Vimeo = (window as any).Vimeo;
    this.container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${this.videoId}?controls=0&title=0&byline=0&portrait=0`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    this.container.appendChild(iframe);

    return new Promise((resolve) => {
      this.player = new Vimeo.Player(iframe);
      this.player.ready().then(() => {
        this.player.getDuration().then((d: number) => { this._duration = d; });
        if (this.options.muted) this.player.setMuted(true);
        if (this.options.autoplay) this.play();

        this.player.on('play', () => { this._paused = false; this.emit('statechange', 'playing'); });
        this.player.on('pause', () => { this._paused = true; this.emit('statechange', 'paused'); });
        this.player.on('ended', () => { this._paused = true; this.emit('statechange', 'ended'); });
        this.player.on('bufferstart', () => { this.emit('statechange', 'buffering'); });
        this.player.on('bufferend', () => { this.emit('statechange', this._paused ? 'paused' : 'playing'); });
        this.player.on('timeupdate', (d: { seconds: number }) => {
          this._currentTime = d.seconds;
          this.emit('timeupdate', d.seconds);
        });
        this.player.getQualities().then((q: string[]) => { this._qualities = q; }).catch(() => {});
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
  async setQuality(quality: string) { try { await this.player?.setQuality(quality); } catch {} }
  getQualities(): string[] { return this._qualities; }
  requestPiP() {
    const iframe = this.container.querySelector('iframe');
    if (iframe && document.pictureInPictureEnabled) {
      iframe.requestPictureInPicture?.();
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/video-vimeo-adapter.ts
git commit -m "feat: create Vimeo player adapter"
```

---

### Task 5: Create VideoPlayer React component

**Files:**
- Create: `components/website-editor/components/VideoPlayer.tsx`

**Interfaces:**
- Consumes: `Element` from `block-types`, `parseVideoUrl` from `video-url-parser`, `createVideoPlayer` from Task 2
- Produces: `VideoPlayer` React component

- [ ] **Step 1: Create the directory**

```bash
mkdir -p components/website-editor/components
```

- [ ] **Step 2: Write VideoPlayer.tsx**

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Element } from '../lib/block-types';
import { parseVideoUrl, getAutoThumbnail } from '../lib/video-url-parser';
import type { VideoPlayerAPI } from '../lib/video-player-api';
import { createVideoPlayer } from '../lib/video-player-api';

interface VideoPlayerProps {
  element: Element;
  preview?: boolean;
}

const playButtonsSvg = {
  circle: (
    <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    </div>
  ),
  square: (
    <div className="w-14 h-14 rounded-xl bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 ml-0.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    </div>
  ),
  minimal: (
    <div className="transition-transform duration-200 group-hover:scale-110">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-white drop-shadow-lg"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    </div>
  ),
};

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ element, preview = false }: VideoPlayerProps) {
  const parsed = parseVideoUrl(element.videoUrl || '');
  const [started, setStarted] = useState(!!element.autoplay);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<VideoPlayerAPI | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(element.muted ?? false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(element.muted ? 0 : 80);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [showControls, setShowControls] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = element.controlBarTheme || 'dark';

  const initPlayer = useCallback(async () => {
    if (!containerRef.current || !parsed) return;
    setStarted(true);

    const api = await createVideoPlayer(
      containerRef.current,
      parsed.provider,
      parsed.videoId,
      { muted: element.muted, autoplay: element.autoplay, loop: element.loop }
    );
    apiRef.current = api;

    api.addEventListener('statechange', (state) => {
      const s = state as string;
      setIsPlaying(s === 'playing');
      if (s === 'ended' || s === 'paused') setShowControls(true);
      if (s === 'buffering') {
        /* loading state */
      }
    });

    api.addEventListener('timeupdate', (t) => {
      setCurrentTime(t as number);
    });

    setDuration(api.getDuration());
    setIsMuted(api.isMuted());
    setQualities(api.getQualities());
  }, [parsed, element.muted, element.autoplay, element.loop]);

  useEffect(() => {
    if (element.autoplay && parsed && !started) {
      initPlayer();
    }
  }, [element.autoplay, parsed, started, initPlayer]);

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };
  const handleMouseLeave = () => {
    if (isPlaying) hideTimer.current = setTimeout(() => setShowControls(false), 1000);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    apiRef.current?.seekTo(pct * duration);
  };

  const togglePlay = () => {
    if (!apiRef.current) return;
    if (apiRef.current.isPaused()) apiRef.current.play();
    else apiRef.current.pause();
  };

  const toggleMute = () => {
    if (!apiRef.current) return;
    if (isMuted) { apiRef.current.unmute(); setVolumeState(volume || 80); setIsMuted(false); }
    else { apiRef.current.mute(); setIsMuted(true); }
  };

  const handleVolume = (v: number) => {
    apiRef.current?.setVolume(v);
    setVolumeState(v);
    if (v === 0) { setIsMuted(true); }
    else if (isMuted) { apiRef.current?.unmute(); setIsMuted(false); }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current?.closest('.video-player-wrapper') || containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const aspectRatioMap: Record<string, string> = {
    '16:9': '16/9', '4:3': '4/3', '1:1': '1/1',
  };

  if (!parsed) {
    return (
      <div
        style={{ backgroundColor: element.bgColor || '#f1f5f9', borderRadius: element.borderRadius }}
        className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span className="text-[11px] text-slate-400 font-medium">Paste a YouTube or Vimeo URL</span>
      </div>
    );
  }

  const thumbnailSrc = element.thumbnailUrl || getAutoThumbnail(parsed);
  const playStyle = element.playButtonStyle || 'circle';
  const overlayColor = element.overlayColor || 'rgba(0,0,0,0.3)';
  const controlsVisible = element.showControls !== false && (showControls || !started);

  const ct = theme === 'light'
    ? { bg: 'rgba(255,255,255,0.9)', text: '#1a1a1a', progress: '#2563eb', buffer: 'rgba(0,0,0,0.15)', track: 'rgba(0,0,0,0.1)', iconHover: 'rgba(0,0,0,0.05)' }
    : { bg: 'rgba(0,0,0,0.8)', text: '#ffffff', progress: '#ef4444', buffer: 'rgba(255,255,255,0.3)', track: 'rgba(255,255,255,0.2)', iconHover: 'rgba(255,255,255,0.1)' };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-player-wrapper w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden group"
        style={{
          aspectRatio: aspectRatioMap[element.aspectRatio || '16:9'] || '16/9',
          borderRadius: element.borderRadius,
          backgroundColor: element.bgColor || '#000000',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {!started && (
          <>
            <img
              src={thumbnailSrc}
              alt={element.name || 'Video thumbnail'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
            <button
              onClick={initPlayer}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              {playButtonsSvg[playStyle]}
            </button>
          </>
        )}

        {started && element.showControls !== false && (
          <div
            className="absolute inset-0 flex flex-col justify-end pointer-events-none"
            style={{ opacity: controlsVisible ? 1 : 0, transition: 'opacity 300ms ease' }}
          >
            <div className="pointer-events-auto px-3 pb-1">
              <div
                className="w-full cursor-pointer relative"
                style={{ padding: '6px 0' }}
                onClick={seek}
              >
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: ct.track }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: ct.progress }} />
                </div>
              </div>
            </div>

            <div
              className="pointer-events-auto flex items-center gap-2 px-3 py-2"
              style={{
                backgroundColor: ct.bg,
                borderBottomLeftRadius: element.borderRadius,
                borderBottomRightRadius: element.borderRadius,
              }}
            >
              <button onClick={togglePlay} className="flex items-center justify-center w-8 h-8 rounded-md transition-colors" style={{ color: ct.text }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ct.iconHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                )}
              </button>

              <span className="text-xs tabular-nums select-none" style={{ color: ct.text, minWidth: '80px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              <div className="flex items-center gap-1 group/vol">
                <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center rounded-md transition-colors" style={{ color: ct.text }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ct.iconHover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                  {(isMuted || volume === 0) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><line x1="17" y1="7" x2="23" y2="16" stroke="currentColor" strokeWidth="2"/><line x1="23" y1="7" x2="17" y2="16" stroke="currentColor" strokeWidth="2"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  )}
                </button>
                <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolume(parseInt(e.target.value))}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200"
                  style={{ accentColor: ct.progress }} />
              </div>

              {qualities.length > 0 && (
                <select value={currentQuality}
                  onChange={(e) => { setCurrentQuality(e.target.value); apiRef.current?.setQuality(e.target.value); }}
                  className="bg-transparent text-xs rounded px-1 py-0.5 cursor-pointer outline-none"
                  style={{ color: ct.text }}>
                  <option value="auto">Auto</option>
                  {qualities.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              )}

              {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                <button onClick={() => apiRef.current?.requestPiP()}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-colors" style={{ color: ct.text }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ct.iconHover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  title="Picture in Picture">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="10" height="8" rx="1"/></svg>
                </button>
              )}

              <button onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors" style={{ color: ct.text }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ct.iconHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                title="Fullscreen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/components/VideoPlayer.tsx
git commit -m "feat: create VideoPlayer component with custom controls"
```

---

### Task 6: Integrate VideoPlayer into canvas rendering

**Files:**
- Modify: `components/website-editor/index.tsx:158-264` (replace the video type case)

**Interfaces:**
- Consumes: `VideoPlayer` from Task 5
- Add import: `import { VideoPlayer } from './components/VideoPlayer';`

- [ ] **Step 1: Replace video rendering block in RenderElementContent**

In `index.tsx`, find the block starting at `if (element.type === "video") {` (line 158) and ending at `}` before `return null;` (line 266).

Replace the entire block with:
```tsx
if (element.type === "video") {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <VideoPlayer element={element} preview={true} />
    </div>
  );
}
```

Add import at the top of the file, near other component imports:
```typescript
import { VideoPlayer } from './components/VideoPlayer';
```

- [ ] **Step 2: Remove unused imports (if any)**

If `parseVideoUrl`, `getAutoThumbnail`, `buildEmbedUrl` are no longer used in index.tsx after this change, remove them from imports.

Check line 1-30 of index.tsx for these imports and remove any that are only used by the old video block.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat: integrate VideoPlayer component into canvas"
```

---

### Task 7: Add new inspector controls

**Files:**
- Modify: `components/website-editor/inspector/VideoInspector.tsx` (after Loop checkbox, before Border Radius)

**Interfaces:**
- Consumes: `Element` from `block-types`

- [ ] **Step 1: Add new controls after Loop**

In `VideoInspector.tsx`, after the Loop checkbox section (after line 162 `</div>`), insert:

```tsx
{/* Muted */}
<div className="flex items-center justify-between">
  <label className="text-[10px] font-bold text-slate-500">Muted</label>
  <input
    type="checkbox"
    checked={element.muted ?? false}
    onChange={(e) => update({ muted: e.target.checked })}
    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
  />
</div>

{/* Show Controls */}
<div className="flex items-center justify-between">
  <label className="text-[10px] font-bold text-slate-500">Show Controls</label>
  <input
    type="checkbox"
    checked={element.showControls !== false}
    onChange={(e) => update({ showControls: e.target.checked })}
    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
  />
</div>

{/* Control Bar Theme */}
<div className="space-y-1">
  <label className="text-[10px] font-bold text-slate-500">Control Bar Theme</label>
  <div className="grid grid-cols-2 gap-1.5">
    {[
      { value: 'dark' as const, label: 'Dark' },
      { value: 'light' as const, label: 'Light' },
    ].map((t) => (
      <button
        key={t.value}
        onClick={() => update({ controlBarTheme: t.value })}
        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
          (element.controlBarTheme || 'dark') === t.value
            ? 'bg-blue-50 text-blue-700 border-blue-300'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/inspector/VideoInspector.tsx
git commit -m "feat: add muted, showControls, controlBarTheme inspector controls"
```

---

### Task 8: Export HTML with custom video player

**Files:**
- Modify: `components/website-editor/lib/html-generator.ts:60-83` and `:250-273` (both video blocks)
- Create: `components/website-editor/lib/video-export-js.ts`

**Approach:** For exported HTML, generate a lite embed thumbnail. On click, load YT/Vimeo API and build the custom player controls via vanilla JS, mirroring the React component behavior.

- [ ] **Step 1: Create video-export-js.ts**

```typescript
export function generateVideoExportJS(): string {
  return `
<script>
(function() {
  var players = {};

  function loadScript(src, id, onload) {
    if (document.getElementById(id)) { onload(); return; }
    var s = document.createElement('script');
    s.src = src; s.id = id; s.onload = onload;
    document.head.appendChild(s);
  }

  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function createControls(container, theme) {
    var ct = theme === 'light'
      ? { bg: 'rgba(255,255,255,0.9)', text: '#1a1a1a', progress: '#2563eb', track: 'rgba(0,0,0,0.1)', iconBg: 'rgba(0,0,0,0.05)' }
      : { bg: 'rgba(0,0,0,0.8)', text: '#ffffff', progress: '#ef4444', track: 'rgba(255,255,255,0.2)', iconBg: 'rgba(255,255,255,0.1)' };

    var controlsOverlay = document.createElement('div');
    controlsOverlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;transition:opacity 300ms ease;';

    var progressWrap = document.createElement('div');
    progressWrap.style.cssText = 'pointer-events:auto;padding:0 12px 4px;';
    progressWrap.innerHTML = '<div style="width:100%;cursor:pointer;padding:6px 0;"><div style="width:100%;height:4px;border-radius:2px;overflow:hidden;background:' + ct.track + ';"><div class="vp-progress-fill" style="height:100%;border-radius:2px;width:0%;background:' + ct.progress + ';"></div></div></div>';
    controlsOverlay.appendChild(progressWrap);

    var bar = document.createElement('div');
    bar.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:8px;padding:6px 12px;background:' + ct.bg + ';';
    bar.innerHTML = '<button class="vp-play-btn" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg></button>' +
      '<span class="vp-time" style="font-size:12px;font-variant-numeric:tabular-nums;color:' + ct.text + ';min-width:80px;">0:00 / 0:00</span>' +
      '<div style="flex:1;"></div>' +
      '<button class="vp-mute-btn" style="width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg></button>' +
      '<input type="range" min="0" max="100" value="80" class="vp-volume" style="width:0;transition:width 0.2s;accent-color:' + ct.progress + ';" onmouseenter="this.style.width=\\'80px\\'" onmouseleave="this.style.width=\\'0\\'">' +
      '<button class="vp-fs-btn" style="width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>';
    controlsOverlay.appendChild(bar);

    var hideTimer = null;
    function showCtls() {
      controlsOverlay.style.opacity = '1';
      if (hideTimer) clearTimeout(hideTimer);
    }
    function hideCtls() {
      hideTimer = setTimeout(function() { controlsOverlay.style.opacity = '0'; }, 3000);
    }

    container.addEventListener('mouseenter', showCtls);
    container.addEventListener('mousemove', function() { showCtls(); hideCtls(); });
    container.addEventListener('mouseleave', function() { hideTimer = setTimeout(function() { controlsOverlay.style.opacity = '0'; }, 1000); });

    container.appendChild(controlsOverlay);
    return { overlay: controlsOverlay, bar: bar, progressFill: controlsOverlay.querySelector('.vp-progress-fill'), timeLabel: controlsOverlay.querySelector('.vp-time'), playBtn: controlsOverlay.querySelector('.vp-play-btn'), muteBtn: controlsOverlay.querySelector('.vp-mute-btn'), fsBtn: controlsOverlay.querySelector('.vp-fs-btn'), progressWrap: progressWrap, ct: ct };
  }

  function initYouTube(container, videoId, theme) {
    var iframe = container.querySelector('iframe');
    if (!iframe) { iframe = document.createElement('iframe'); iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;';  container.appendChild(iframe); }

    var ctls = createControls(container, theme);
    var player;

    loadScript('https://www.youtube.com/iframe_api', 'yt-iframe-api', function() {
      if (!window.YT || !window.YT.Player) { window.onYouTubeIframeAPIReady = function() { createPlayer(); }; return; }
      createPlayer();
    });

    function createPlayer() {
      player = new YT.Player(iframe, {
        videoId: videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: function() {
            var dur = player.getDuration() || 0;
            ctls.timeLabel.textContent = formatTime(0) + ' / ' + formatTime(dur);
            setInterval(function() {
              if (!player || player.getPlayerState() !== 1) return;
              var t = player.getCurrentTime();
              var d = player.getDuration() || dur;
              ctls.progressFill.style.width = (d > 0 ? (t / d) * 100 : 0) + '%';
              ctls.timeLabel.textContent = formatTime(t) + ' / ' + formatTime(d);
            }, 500);
          }
        }
      });

      ctls.progressWrap.addEventListener('click', function(e) {
        if (!player || !player.getDuration) return;
        var pct = (e.clientX - ctls.progressWrap.getBoundingClientRect().left) / ctls.progressWrap.offsetWidth;
        player.seekTo(pct * player.getDuration(), true);
      });

      ctls.playBtn.addEventListener('click', function() {
        if (player.getPlayerState() === 1) player.pauseVideo();
        else player.playVideo();
      });

      ctls.muteBtn.addEventListener('click', function() {
        if (player.isMuted()) player.unMute();
        else player.mute();
      });

      ctls.fsBtn.addEventListener('click', function() {
        if (document.fullscreenElement) document.exitFullscreen();
        else container.requestFullscreen();
      });

      var volSlider = container.querySelector('.vp-volume');
      if (volSlider) {
        volSlider.addEventListener('input', function() { player.setVolume(parseInt(this.value)); });
      }
    }
  }

  document.querySelectorAll('[data-video-player]').forEach(function(el) {
    var videoId = el.getAttribute('data-video-id');
    var provider = el.getAttribute('data-video-provider');
    var theme = el.getAttribute('data-video-theme') || 'dark';

    el.addEventListener('click', function initOnce() {
      el.removeEventListener('click', initOnce);
      el.querySelector('.vp-thumbnail') && el.querySelector('.vp-thumbnail').remove();
      el.querySelector('.vp-overlay') && el.querySelector('.vp-overlay').remove();
      el.querySelector('.vp-play-btn-static') && el.querySelector('.vp-play-btn-static').remove();

      if (provider === 'youtube') initYouTube(el, videoId, theme);
      if (provider === 'vimeo') {
        el.innerHTML = '<iframe src="https://player.vimeo.com/video/' + videoId + '?controls=0&title=0&byline=0&portrait=0&autoplay=1" style="width:100%;height:100%;border:none;" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe>';
      }
    });
  });
})();
<\/script>`;
}
```

- [ ] **Step 2: Replace video export in generateFullHTML (lines 60-83)**

Replace the entire video block (lines 60-83) in `generateFullHTML` with:

```typescript
if (el.type === 'video') {
  const parsed = parseVideoUrl((el as any).videoUrl || '');
  if (!parsed) {
    return `        <div ${idAttr} style="background-color: ${(el as any).bgColor || '#f1f5f9'}; border-radius: ${(el as any).borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
  }

  const thumbnailSrc = (el as any).thumbnailUrl || getAutoThumbnail(parsed);
  const playStyle = (el as any).playButtonStyle || 'circle';
  const overlayColor = (el as any).overlayColor || 'rgba(0,0,0,0.3)';
  const aspectRatio = (el as any).aspectRatio || '16:9';
  const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
  const theme = (el as any).controlBarTheme || 'dark';

  const playButtons: Record<string, string> = {
    circle: '<div class="vp-play-btn-static" style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color:#1e293b;margin-left:2px"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
    square: '<div class="vp-play-btn-static" style="width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="color:#1e293b;margin-left:1px"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
    minimal: '<div class="vp-play-btn-static"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="color:white;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3))"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
  };

  if ((el as any).autoplay) {
    const embedUrl = buildEmbedUrl(parsed, { autoplay: true, loop: (el as any).loop });
    const muted = (el as any).muted ?? false;
    return `        <div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'};"><iframe src="${embedUrl}&controls=0" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay${muted ? '; muted' : ''}; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }

  return `        <div ${idAttr} data-video-player data-video-id="${parsed.videoId}" data-video-provider="${parsed.provider}" data-video-theme="${theme}" style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'}; cursor: pointer; position: relative;"><img class="vp-thumbnail" src="${thumbnailSrc}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/><div class="vp-overlay" style="position:absolute;inset:0;background:${overlayColor}"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">${playButtons[playStyle]}</div></div>`;
}
```

- [ ] **Step 3: Apply same replacement to generateMultiPageHTML (lines 250-273)**

Apply the identical replacement to the duplicate video block in `generateMultiPageHTML`.

- [ ] **Step 4: Add the export JS to page footer**

In `generateFullHTML`, after the closing `</body>` tag, add:
```
${generateVideoExportJS()}
```

Apply same in `generateMultiPageHTML`.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/lib/html-generator.ts components/website-editor/lib/video-export-js.ts
git commit -m "feat: add custom video player to HTML export"
```

---

### Task 9: Final verification

- [ ] **Step 1: TypeScript check**

```bash
rtk tsc --noEmit
```

- [ ] **Step 2: Dev server test**

```bash
# Dev server already running on localhost:3000
# Manual test: add video element, click play, verify custom controls appear
# Test seek, volume, fullscreen
```

- [ ] **Step 3: Export HTML test**

Use export feature, open HTML in browser, verify video player with custom controls works.

- [ ] **Step 4: Commit final changes if any**

```bash
git add -A && git commit -m "feat: complete custom video player implementation"
```
