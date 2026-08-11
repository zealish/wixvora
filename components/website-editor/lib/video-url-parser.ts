type VideoProvider = 'youtube' | 'vimeo';

export interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null;

  const trimmed = url.trim();

  const youtubeWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeWatchMatch?.[1]) {
    const videoId = youtubeWatchMatch[1];
    return {
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
    };
  }

  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch?.[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
    };
  }

  return null;
}

export function buildEmbedUrl(parsed: ParsedVideo, options: { autoplay?: boolean; loop?: boolean }): string {
  let url = parsed.embedUrl;

  if (options.autoplay) {
    url += url.includes('?') ? '&' : '?';
    url += 'autoplay=1';
  }

  if (options.loop) {
    url += '&loop=1';
    if (parsed.provider === 'youtube') {
      url += `&playlist=${parsed.videoId}`;
    }
  }

  return url;
}
