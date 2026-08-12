'use client';

import Image from 'next/image';
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
  if (!t || isNaN(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayer({ element }: VideoPlayerProps) {
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
  const [playerReady, setPlayerReady] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = element.controlBarTheme || 'dark';

  const initPlayer = useCallback(async () => {
    if (!containerRef.current || !parsed) return;
    setStarted(true);

    const opts: { muted?: boolean; autoplay?: boolean; loop?: boolean } = {};
    if (element.muted !== undefined) opts.muted = element.muted;
    if (element.autoplay !== undefined) opts.autoplay = element.autoplay;
    if (element.loop !== undefined) opts.loop = element.loop;

    const api = await createVideoPlayer(
      containerRef.current,
      parsed.provider,
      parsed.videoId,
      opts
    );
    apiRef.current = api;

    api.addEventListener('statechange', (state) => {
      const s = state as string;
      setIsPlaying(s === 'playing');
      if (s === 'ended' || s === 'paused') setShowControls(true);
    });

    api.addEventListener('timeupdate', (t) => {
      setCurrentTime(t as number);
    });

    setDuration(api.getDuration());
    setIsMuted(api.isMuted());
    setQualities(api.getQualities());
    setPlayerReady(true);
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
    if (!duration || !apiRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const targetTime = pct * duration;
    apiRef.current.seekTo(targetTime);
    setCurrentTime(targetTime);
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
    if (v === 0) setIsMuted(true);
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
  const controlsVisible = element.showControls !== false && (showControls || !playerReady);

  const ct = theme === 'light'
    ? { bg: 'rgba(255,255,255,0.9)', text: '#1a1a1a', progress: '#2563eb', track: 'rgba(0,0,0,0.1)', iconHover: 'rgba(0,0,0,0.05)' }
    : { bg: 'rgba(0,0,0,0.8)', text: '#ffffff', progress: '#ef4444', track: 'rgba(255,255,255,0.2)', iconHover: 'rgba(255,255,255,0.1)' };

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
            <Image
              src={thumbnailSrc}
              alt={element.name || 'Video thumbnail'}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
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
            style={{ zIndex: 1, opacity: controlsVisible ? 1 : 0, transition: 'opacity 300ms ease' }}
          >
            <div className="pointer-events-auto px-3 pb-1">
              <div
                className="w-full cursor-pointer relative"
                style={{ padding: '6px 0' }}
                onClick={seek}
              >
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: ct.track }}>
                  <div className="h-full rounded-full transition-[width]" style={{ width: `${progressPct}%`, backgroundColor: ct.progress }} />
                </div>
              </div>
            </div>

            <div
              className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-b-inherit"
              style={{ backgroundColor: ct.bg }}
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
