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

**[All downloads — latest release](https://github.com/TubeTude/multi-track-music/releases/latest)**

| Platform | File | Notes |
|---|---|---|
| macOS (Apple Silicon + Intel) | `MultiTrackMusic-<version>-universal.dmg` | macOS 10.12 or later |
| Windows | `MultiTrackMusic-Setup-<version>.exe` | 64-bit |
| Linux ARM64 (Quill / Raspberry Pi / ARM Ubuntu) | `MultiTrackMusic-<version>-arm64.deb` | Recommended — apt resolves dependencies |
| Linux ARM64 (no install) | `MultiTrackMusic-<version>-arm64.AppImage` | Portable; needs FUSE |

> **First launch on macOS:** Right-click the app → Open → Open (one-time security bypass for unsigned apps)

### Installing on Quill / ARM64 Ubuntu

QuillOS is Ubuntu-based on ARM64, so the `.deb` is the smoothest path — `apt` pulls in
Electron's runtime libraries for you:

```bash
sudo apt install ./MultiTrackMusic-<version>-arm64.deb
```

Launch it from the GNOME activities overview, or run `multi-track-music` from a terminal.

Prefer no install? Use the AppImage:

```bash
chmod +x MultiTrackMusic-<version>-arm64.AppImage
./MultiTrackMusic-<version>-arm64.AppImage
```

If the AppImage won't start, the usual causes are a missing FUSE library
(`sudo apt install libfuse2`) or a kernel that restricts user namespaces — in the
latter case run it with `--no-sandbox`.

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

### Build for Quill / ARM64 Linux

```bash
npm run build:linux
```

Produces `MultiTrackMusic-<version>-arm64.deb` and `.AppImage` in `dist/`.

Two constraints are worth knowing before you try this on the Quill itself:

- **The `.deb` cannot be built on an ARM64 host.** electron-builder bundles only an
  x86 `fpm`, so deb packaging dies with `Exec format error` on the Quill or on an
  ARM64 CI runner. Build it from macOS or x64 Linux instead — `fpm` merely packages
  the already-cross-compiled ARM payload, so the result is still a valid arm64
  package. The AppImage builds fine on any host.
- **`ffmpeg-static` downloads a single platform binary at install time.** When
  building from an x64 host, set the target arch explicitly or you will bundle an
  x86 ffmpeg inside an ARM app:

  ```bash
  npm_config_platform=linux npm_config_arch=arm64 npm ci
  file node_modules/ffmpeg-static/ffmpeg   # should report ARM aarch64
  ```

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
