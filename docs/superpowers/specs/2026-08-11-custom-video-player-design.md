# Custom Video Player Design

**Date:** 2026-08-11
**Status:** Approved
**Context:** Replace raw YouTube/Vimeo iframe embeds with custom-styled video player controls layered on top of the platform iframe with `controls=0`.

## Problem

Current video player renders raw YouTube and Vimeo `<iframe>` embeds with their native branded UI. Users want a custom player with branded controls (play, seek, volume, quality, PiP, fullscreen) that matches the website design, while keeping video source from YouTube/Vimeo.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Approach | Official YouTube IFrame API + Vimeo Player API, **zero new npm dependencies** |
| Source | YouTube/Vimeo iframes with `controls=0` (hide native UI) |
| Control bar style | Floating overlay, appears on hover, auto-hides after 3s idle |
| Features | Play/pause, progress seek, mute/volume, quality selector, PiP, fullscreen, time display |
| Themes | Dark (`rgba(0,0,0,0.8)` bg) and Light (`rgba(255,255,255,0.9)` bg) |
| Mobile | Tap to toggle controls, no hover; thicker progress bar (6px) |
| Lite embed | Thumbnail + play button first, player loads on click |
| Autoplay | If autoplay on, skip thumbnail and load player directly |

## Global Constraints

- Zero new npm dependencies
- Backward compatible — all existing video props preserved unchanged
- TypeScript strict — no `any` casts in new code
- Export HTML must be self-contained (no external JS dependencies)
- `controls=0` on all embedded iframes to hide native YouTube/Vimeo UI

## Architecture

### Abstraction Layer

One unified TypeScript interface hiding YouTube/Vimeo API differences:

```typescript
interface VideoPlayerAPI {
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
```

- `YouTubePlayerAdapter` wraps `window.YT.Player`, loads YT IFrame API on demand
- `VimeoPlayerAdapter` wraps `window.Vimeo.Player`, loads Vimeo Player.js on demand
- `createVideoPlayer()` factory function dispatches to correct adapter

### Component Tree

```
CustomVideoPlayer
├── PlayerContainer (aspect-ratio wrapper, relative positioned)
│   ├── ThumbnailLayer (shown before play, lite embed)
│   ├── PlayerMount (div where YT/Vimeo iframe mounts, controls=0)
│   └── VideoControls (absolute bottom, floating overlay)
│       ├── ProgressBar (always visible 4px, click-seek, buffered indicator)
│       ├── PlayPauseButton
│       ├── TimeDisplay (current / duration, monospace 12px)
│       ├── VolumeControl (mute icon + horizontal slider)
│       ├── QualitySelector (dropdown: Auto / 1080p / 720p / 480p / 360p)
│       ├── PiPButton (if browser supports)
│       └── FullscreenButton
```

### New Files

| File | Purpose |
|------|---------|
| `components/website-editor/lib/video-player-api.ts` | `VideoPlayerAPI` interface + `createVideoPlayer()` + `loadScript()` |
| `components/website-editor/lib/video-youtube-adapter.ts` | YouTube IFrame API adapter (~100 lines) |
| `components/website-editor/lib/video-vimeo-adapter.ts` | Vimeo Player API adapter (~100 lines) |
| `components/website-editor/components/VideoPlayer.tsx` | `VideoPlayer` component (~300 lines) |
| `components/website-editor/lib/video-export-js.ts` | Vanilla JS for HTML export (~300 lines) |

### Modified Files

| File | Change |
|------|--------|
| `components/website-editor/lib/block-types.ts` | Add `muted`, `showControls`, `controlBarTheme` |
| `components/website-editor/lib/element-presets.ts` | Add defaults for new props |
| `components/website-editor/index.tsx` | Replace video case with `<VideoPlayer>` component |
| `components/website-editor/inspector/VideoInspector.tsx` | Add new control toggles |
| `components/website-editor/lib/html-generator.ts` | Replace video export with custom player HTML+JS |

## New Element Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `muted` | `boolean` | `false` | Mute state (for autoplay compliance) |
| `showControls` | `boolean` | `true` | Show/hide custom control bar |
| `controlBarTheme` | `'dark' \| 'light'` | `'dark'` | Control bar color theme |

## Control Bar Behavior

### Visibility Rules
1. Controls appear on mouse enter video area
2. Auto-hide after 3s of no mouse movement
3. When video paused or ended → controls stay visible
4. Transition: opacity fade 300ms ease
5. Progress bar always visible at 4px height

### Layout
```
▶ 0:42 / 3:15     🔊 ▁▁▁▁▁  HD ⤢
```

### Themes
| Element | Dark | Light |
|---------|------|-------|
| Background | `rgba(0,0,0,0.8)` | `rgba(255,255,255,0.9)` |
| Text/Icons | `#ffffff` | `#1a1a1a` |
| Progress filled | `#ef4444` (red-500) | `#2563eb` (blue-600) |
| Progress buffered | `rgba(255,255,255,0.3)` | `rgba(0,0,0,0.15)` |
| Progress track | `rgba(255,255,255,0.2)` | `rgba(0,0,0,0.1)` |

## HTML Export

Export generates vanilla JS inline mirroring the React component behavior:
1. Thumbnail + play button (lite embed)
2. Click → load YT/Vimeo API → build controls DOM → wire events
3. Self-contained, no external dependencies
4. Same control bar behavior (hover, auto-hide, time, volume, quality, PiP, fullscreen)

## Backward Compatibility

- All existing props preserved unchanged
- `playButtonStyle`, `overlayColor` apply to lite embed thumbnail state only
- Autoplay mode: iframe + `controls=0` + custom controls
- New props have safe defaults for existing elements
- Existing video elements without new props work as before (defaults apply)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| YouTube/Vimeo API change breaks controls | If API unavailable, fall back to default iframe with native controls |
| Performance: rAF/progress polling | Only poll when player is active; stop when paused or hidden |

## Non-Goals

- No direct MP4/WebM support
- No subtitles/captions, playback speed, share, or theater mode
- No mobile-specific layout (same component, tap vs hover handled by events)
