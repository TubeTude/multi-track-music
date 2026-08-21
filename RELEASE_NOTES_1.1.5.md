# Multi-Track Music 1.1.5

- Serializes camera/microphone acquisition so rapid track activation cannot create multiple permission requests.
- Opens the selected camera and microphone once at session start, then reuses that shared capture stream for every track.
- Adds Electron permission-check handling alongside the existing permission-request handler.
- Retains the clean raw-audio capture, silent live monitoring, master headroom, peak limiting, and track recovery improvements from 1.1.4.

Because this local build is unsigned, macOS may ask once after installing a newly rebuilt app. It should not ask once per track.
