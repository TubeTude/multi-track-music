# Multi-Track Music 1.1.4

## Audio quality and reliability

- Captures clean microphone audio without browser echo cancellation, noise suppression, or automatic gain control.
- Uses the audio interface/system-native sample rate instead of forcing a real-time 48 kHz conversion.
- Prevents delayed software mic monitoring from combining with interface direct monitoring and causing hollow comb-filter distortion.
- Adds mix-bus headroom and transparent peak limiting for safer multitrack playback.
- Limits the master control to unity gain to prevent accidental output clipping.
- Removes a duplicate effects-chain connection.

## Track recovery

- Adds a reset control to each mixer track for recovering from an interrupted or glitched recording state.
- Resetting a track clears only live player state; saved video and WAV files remain untouched.

## Browser sharing handoff

- Adds `TUDE_BUILD_MULTITRACK_VIDEO_SPEC.md`, an implementation brief for resumable video uploads, synchronized multivideo playback, lightweight audio controls, ShortKit integration, and web audio-delivery targets.

## macOS installation

This build is not signed or notarized. If macOS blocks the first launch, open **System Settings → Privacy & Security** and choose **Open Anyway** after the blocked launch attempt.
