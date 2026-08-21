# tude.build handoff: lightweight synchronized multitrack video

## Goal

Build a browser experience where a creator uploads 2–12 MusicMem video tracks, publishes them as one session, and viewers can play every angle simultaneously while controlling the audible tracks. Keep it fast on phones and simple enough to share by URL.

This is a playback and sharing product, not a browser DAW. The first release needs synchronized play/pause/seek, per-track mute/volume, one master volume, layout selection, and a shareable session page. It does not need recording, waveform editing, EQ, compression, or reverb.

## ShortKit decision

Use ShortKit for upload/transcoding/hosting only if our ShortKit account exposes its partner REST upload API and supports attaching custom metadata. Do not assume undocumented endpoint names. Obtain the current upload API contract and credentials from ShortKit before implementation.

Store these metadata values with every uploaded track:

- `sessionId`
- `trackId`
- `trackIndex`
- `role`: `video-angle`, `master-audio`, or `video-with-audio`
- `startOffsetMs`
- `durationMs`
- `layoutHint`

ShortKit documents HLS playback, custom metadata, static MP4 fallbacks, and video carousels. Its carousel player hands playback between videos; that is not the same as playing multiple angles simultaneously. Therefore, use a custom browser player for the synchronized session even when ShortKit hosts the media.

If ShortKit upload access is unavailable, use direct signed uploads to object storage and a background transcoding service. Preserve the same session manifest so the player is hosting-provider independent.

## Upload flow

1. User creates a session and chooses 2–12 files.
2. Browser calculates file name, size, MIME type, duration, and a SHA-256 fingerprint.
3. Backend creates one resumable/signed upload per track. API secrets must never reach the browser.
4. Browser uploads tracks concurrently with a limit of three active uploads, progress, cancel, and retry.
5. Backend/ShortKit transcodes each track to HLS and generates a poster plus MP4 fallback.
6. Backend waits until every required track is playable, probes exact duration, and saves the final manifest.
7. The session becomes publishable and receives a stable share URL.

Recommended endpoints for the tude.build application layer:

```text
POST   /api/video-sessions
POST   /api/video-sessions/:sessionId/uploads
POST   /api/video-sessions/:sessionId/uploads/:trackId/complete
GET    /api/video-sessions/:sessionId
PATCH  /api/video-sessions/:sessionId
POST   /api/video-sessions/:sessionId/publish
```

## Session manifest

The player should consume one provider-neutral JSON document:

```json
{
  "version": 1,
  "sessionId": "session_123",
  "title": "Studio take 4",
  "durationMs": 183420,
  "posterUrl": "https://cdn.example/session_123/poster.jpg",
  "masterAudioTrackId": "track_1",
  "tracks": [
    {
      "id": "track_1",
      "index": 0,
      "label": "Lead vocal",
      "hlsUrl": "https://cdn.example/track_1/master.m3u8",
      "fallbackMp4Url": "https://cdn.example/track_1/fallback.mp4",
      "startOffsetMs": 0,
      "initialVolume": 1,
      "initialMuted": false
    },
    {
      "id": "track_2",
      "index": 1,
      "label": "Guitar",
      "hlsUrl": "https://cdn.example/track_2/master.m3u8",
      "fallbackMp4Url": "https://cdn.example/track_2/fallback.mp4",
      "startOffsetMs": 0,
      "initialVolume": 0,
      "initialMuted": true
    }
  ]
}
```

## Browser player architecture

- Render one `<video playsinline preload="metadata">` per visible angle.
- Start all videos muted to satisfy mobile autoplay rules. A viewer gesture starts the session and unlocks audio.
- For the reliable first release, choose one master audio track. Keep every other video element muted. This avoids phase cancellation from microphones that captured the same room at slightly different distances.
- Offer an optional advanced mix mode later. In that mode, connect media elements to Web Audio `GainNode`s and retain per-track mute/volume controls.
- Use the master media element as the clock. On play or seek, set each follower to `master.currentTime + startOffsetMs / 1000`.
- Check drift about four times per second. Ignore drift under 40 ms, gently correct 40–150 ms with a temporary playback rate near `0.98–1.02`, and hard-seek above 150 ms or after buffering/layout changes.
- Never continuously chase tiny timing differences; that creates audible pitch/warble when a video’s own audio is enabled.
- Pause the whole session when the master stalls. Resume only when required visible tracks can continue.
- Use `requestVideoFrameCallback` where available for visual timing, with `timeupdate`/timer fallback.
- On low-memory/mobile devices, show at most four live angles. Use posters for hidden tracks and attach their video elements only when selected.

## Lightweight controls

Required:

- One play/pause button
- One scrubber and elapsed/total time
- Master mute and volume
- Per-track mute and volume
- Solo button per track
- 1, 2, 4, and focus layouts
- Fullscreen/Picture-in-Picture where supported
- Share button
- Clear loading and failed-track states

The interface must remain usable with keyboard controls and screen readers. Do not encode state only by color.

## Audio quality and online delivery

MusicMem should retain its recorded WAV files as archival masters. For browser delivery:

- Normalize the published master conservatively around `-14 LUFS` integrated.
- Keep true peaks at or below `-1 dBTP`.
- Deliver AAC-LC at 256 kbps stereo in HLS; optionally provide Opus at 160–192 kbps where the delivery stack supports it.
- Use 48 kHz for distribution. Resample once during server transcoding with a high-quality resampler, never repeatedly in the browser.
- Do not add automatic noise reduction, echo cancellation, or auto gain to uploaded music.
- Do not sum several open microphones by default. That can cause comb filtering—the hollow “wah-wah” sound.

## Acceptance criteria

- A user can upload 2–12 tracks, reload the page, and resume an interrupted upload.
- A published session opens from a share URL on current Safari, Chrome, Firefox, iOS, and Android.
- One tap starts all visible videos.
- After seeking, visible tracks settle within 100 ms of the master within one second.
- Normal playback does not produce audible pitch modulation.
- Default playback has exactly one audible master track.
- Per-track mute, solo, and volume updates are click-free through short gain ramps.
- A failed follower track does not stop the master; the UI marks it and offers retry.
- No ShortKit secret or storage credential is included in client JavaScript.

## Build order

1. Implement the provider-neutral session schema and upload state machine.
2. Integrate ShortKit upload only after obtaining its current partner API contract; otherwise use signed object-storage uploads.
3. Build the one-master-audio synchronized player.
4. Add per-track controls and layouts.
5. Add drift telemetry and test on real mobile devices.
6. Add optional multitrack Web Audio mixing only after the basic player is stable.

## Do not do

- Do not use independent play buttons as synchronization.
- Do not make every camera microphone audible by default.
- Do not expose provider secrets in the browser.
- Do not invent ShortKit REST routes from examples; use the account’s current partner documentation.
- Do not download every rendition of all 12 tracks on page load.
