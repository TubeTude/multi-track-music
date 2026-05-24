# Multi-Track Music

A professional multi-camera video recorder with a built-in mixing console for Mac. Capture up to 12 simultaneous video and audio tracks, mix in real time with a vintage-inspired console, and export a finished 9:16 reel — all in one app, no plugins required.

![Multi-Track Music](assets/musicmem.png)

---

## Features

- **Multi-camera recording** — up to 12 simultaneous camera slots, each capturing synchronized video + a separate WAV audio file
- **Built-in mixer** — per-track EQ, compression, reverb, and custom analog-style faders
- **8 grid layouts** — 2, 4, 6, 8, 12 uniform grids plus asymmetric T, ⊥, and L formats; switch live without losing loaded content
- **Drag & drop** — drop video clips or still images directly into any track slot
- **Fullscreen monitor** — eye button goes instant full 9:16 on any track; + button composes 2–3 tracks into a split-screen view
- **9:16 export** — one tap renders your session to a vertical video file (Reels, TikTok, Shorts ready)
- **Project folders** — all tracks save to a folder and reload automatically on reopen

---

## Download

**[Download Multi-Track Music v1.0.0 (Mac Universal)](https://github.com/TubeTude/multi-track-music/releases/latest)**

Requires macOS 10.12 or later · Works on Apple Silicon and Intel Macs

> **First launch:** Right-click the app → Open → Open (one-time security bypass for unsigned apps)

---

## Building from Source

### Requirements
- Node.js 18+
- macOS (for building the Mac app)

### Setup

```bash
git clone https://github.com/TubeTude/multi-track-music.git
cd multi-track-music
npm install
```

### Run in development

```bash
npm start
```

### Build for local install (no code signing)

```bash
npm run build:local
```

The app will be in `dist/mac-arm64/Multi-Track Music.app`.

### Build universal DMG (arm64 + x64)

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dmg --universal
```

---

## Tech Stack

- [Electron](https://www.electronjs.org/) — cross-platform desktop shell
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — EQ, compression, reverb, VU metering via AudioWorklet
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — camera and video capture
- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) — video format conversion
- Canvas API — composite export and fullscreen monitor rendering

---

## License

**Commons Clause + MIT**

Free to use, modify, and share. You may **not** sell this software or build a paid product whose value comes primarily from it without explicit written permission.

See [LICENSE](LICENSE) for full terms.

For commercial licensing: juannog@gmail.com

---

## Contributing

Issues and pull requests welcome. Please open an issue first to discuss significant changes.

---

*Built with the assistance of AI coding tools.*
