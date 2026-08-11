export function generateVideoExportJS(): string {
  return `
<script>
(function() {
  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function createControls(container, theme) {
    var ct = theme === 'light'
      ? { bg: 'rgba(255,255,255,0.9)', text: '#1a1a1a', progress: '#2563eb', track: 'rgba(0,0,0,0.1)', iconHover: 'rgba(0,0,0,0.05)' }
      : { bg: 'rgba(0,0,0,0.8)', text: '#ffffff', progress: '#ef4444', track: 'rgba(255,255,255,0.2)', iconHover: 'rgba(255,255,255,0.1)' };

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;transition:opacity 300ms ease;opacity:1;';

    var progressWrap = document.createElement('div');
    progressWrap.style.cssText = 'pointer-events:auto;padding:0 12px 4px;';
    progressWrap.innerHTML = '<div style="width:100%;cursor:pointer;padding:6px 0;"><div style="width:100%;height:4px;border-radius:2px;overflow:hidden;background:' + ct.track + ';"><div class="vp-fill" style="height:100%;border-radius:2px;width:0%;background:' + ct.progress + ';"></div></div></div>';
    overlay.appendChild(progressWrap);

    var bar = document.createElement('div');
    bar.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:8px;padding:6px 12px;background:' + ct.bg + ';';
    bar.innerHTML =
      '<button class="vp-play" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg></button>' +
      '<span class="vp-time" style="font-size:12px;font-variant-numeric:tabular-nums;color:' + ct.text + ';min-width:80px;">0:00 / 0:00</span>' +
      '<div style="flex:1;"></div>' +
      '<button class="vp-mute" style="width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg></button>' +
      '<button class="vp-fs" style="width:32px;height:32px;border-radius:6px;border:none;background:none;cursor:pointer;color:' + ct.text + ';display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>';
    overlay.appendChild(bar);

    container.appendChild(overlay);

    var hideTimer = null;
    var playing = false;

    function show() { overlay.style.opacity = '1'; if (hideTimer) clearTimeout(hideTimer); }
    function scheduleHide() {
      if (!playing) return;
      hideTimer = setTimeout(function() { overlay.style.opacity = '0'; }, 3000);
    }

    container.addEventListener('mouseenter', show);
    container.addEventListener('mousemove', function() { show(); scheduleHide(); });
    container.addEventListener('mouseleave', function() { if (playing) hideTimer = setTimeout(function() { overlay.style.opacity = '0'; }, 1000); });

    return {
      overlay: overlay,
      fill: overlay.querySelector('.vp-fill'),
      timeLabel: overlay.querySelector('.vp-time'),
      playBtn: overlay.querySelector('.vp-play'),
      muteBtn: overlay.querySelector('.vp-mute'),
      fsBtn: overlay.querySelector('.vp-fs'),
      progressWrap: progressWrap,
      ct: ct,
      setPlaying: function(p) { playing = p; }
    };
  }

  var YT_LOADED = false;

  function loadYT(cb) {
    if (YT_LOADED && window.YT && window.YT.Player) { cb(); return; }
    if (!document.getElementById('yt-iframe-api')) {
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.id = 'yt-iframe-api';
      document.head.appendChild(s);
    }
    window.onYouTubeIframeAPIReady = function() { YT_LOADED = true; cb(); };
  }

  function initYouTube(container, videoId, theme) {
    var ctls = createControls(container, theme);
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;';
    iframe.id = 'yt-' + videoId + '-' + Date.now();
    container.appendChild(iframe);

    loadYT(function() {
      var player = new YT.Player(iframe, {
        videoId: videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1, autoplay: 1 },
        events: {
          onReady: function() {
            var dur = player.getDuration() || 0;
            ctls.timeLabel.textContent = formatTime(0) + ' / ' + formatTime(dur);
            setInterval(function() {
              if (!player || typeof player.getPlayerState !== 'function') return;
              var state = player.getPlayerState();
              if (state !== 1) return;
              var t = player.getCurrentTime();
              var d = player.getDuration() || dur;
              ctls.fill.style.width = (d > 0 ? (t / d) * 100 : 0) + '%';
              ctls.timeLabel.textContent = formatTime(t) + ' / ' + formatTime(d);
            }, 250);
          },
          onStateChange: function(e) {
            ctls.setPlaying(e.data === 1);
            if (e.data === 0 || e.data === 2) ctls.overlay.style.opacity = '1';
            if (e.data === 1) {
              var svg = ctls.playBtn.querySelector('svg');
              svg.innerHTML = '<rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/>';
            }
            if (e.data === 2) {
              var svg2 = ctls.playBtn.querySelector('svg');
              svg2.innerHTML = '<polygon points="6 3 20 12 6 21 6 3"/>';
            }
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
        var svg = ctls.muteBtn.querySelector('svg');
        if (player.isMuted()) {
          player.unMute();
          svg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
        } else {
          player.mute();
          svg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3z"/><line x1="17" y1="7" x2="23" y2="16" stroke="currentColor" strokeWidth="2"/><line x1="23" y1="7" x2="17" y2="16" stroke="currentColor" strokeWidth="2"/>';
        }
      });

      ctls.fsBtn.addEventListener('click', function() {
        if (document.fullscreenElement) document.exitFullscreen();
        else container.requestFullscreen();
      });
    });
  }

  function initVimeo(container, videoId, theme) {
    var ctls = createControls(container, theme);
    var iframe = document.createElement('iframe');
    iframe.src = 'https://player.vimeo.com/video/' + videoId + '?controls=0&title=0&byline=0&portrait=0&autoplay=1';
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    container.appendChild(iframe);

    var script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = function() {
      var player = new window.Vimeo.Player(iframe);
      player.ready().then(function() {
        player.getDuration().then(function(d) {
          ctls.timeLabel.textContent = formatTime(0) + ' / ' + formatTime(d);
        });

        player.on('timeupdate', function(data) {
          player.getDuration().then(function(d) {
            ctls.fill.style.width = (d > 0 ? (data.seconds / d) * 100 : 0) + '%';
            ctls.timeLabel.textContent = formatTime(data.seconds) + ' / ' + formatTime(d);
          });
        });

        player.on('play', function() { ctls.setPlaying(true); });
        player.on('pause', function() { ctls.setPlaying(false); ctls.overlay.style.opacity = '1'; });
        player.on('ended', function() { ctls.setPlaying(false); ctls.overlay.style.opacity = '1'; });

        ctls.progressWrap.addEventListener('click', function(e) {
          player.getDuration().then(function(d) {
            var pct = (e.clientX - ctls.progressWrap.getBoundingClientRect().left) / ctls.progressWrap.offsetWidth;
            player.setCurrentTime(pct * d);
          });
        });

        ctls.playBtn.addEventListener('click', function() {
          player.getPaused().then(function(paused) {
            if (paused) player.play();
            else player.pause();
          });
        });

        ctls.muteBtn.addEventListener('click', function() {
          player.getMuted().then(function(m) {
            player.setMuted(!m);
          });
        });

        ctls.fsBtn.addEventListener('click', function() {
          if (document.fullscreenElement) document.exitFullscreen();
          else container.requestFullscreen();
        });
      });
    };
    document.head.appendChild(script);
  }

  document.querySelectorAll('[data-video-player]').forEach(function(el) {
    var videoId = el.getAttribute('data-video-id');
    var provider = el.getAttribute('data-video-provider');
    var theme = el.getAttribute('data-video-theme') || 'dark';

    var clicked = false;
    el.addEventListener('click', function() {
      if (clicked) return;
      clicked = true;
      var thumb = el.querySelector('.vp-thumbnail');
      var ovl = el.querySelector('.vp-overlay');
      var btn = el.querySelector('.vp-play-btn-static');
      if (thumb) thumb.remove();
      if (ovl) ovl.remove();
      if (btn) btn.remove();
      el.style.cursor = 'default';
      if (provider === 'youtube') initYouTube(el, videoId, theme);
      if (provider === 'vimeo') initVimeo(el, videoId, theme);
    });
  });
})();
<\/script>`;
}
