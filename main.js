const { app, BrowserWindow, ipcMain, dialog, session, systemPreferences, Menu } = require('electron');
const path   = require('path');
const fs     = require('fs');
const { execFile } = require('child_process');

// Set name BEFORE anything else — fixes the macOS menu bar bold label
app.name = 'Multi-Track Music';

const ICON = path.join(__dirname, 'assets', 'musicmem.png');
const FFMPEG = (() => {
  try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; }
})();

// Formats natively playable by Chromium in Electron
const NATIVE_EXTS = new Set(['mp4', 'webm', 'ogv', 'm4v']);
const VIDEO_EXTS  = new Set(['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi', 'ogv', 'flv', 'wmv', 'ts', 'mts', 'hevc']);

let win;

function setMenu() {
  const name = app.name;
  const menu = Menu.buildFromTemplate([
    {
      label: name,
      submenu: [
        { label: `About ${name}`, role: 'about' },
        { type: 'separator' },
        { label: `Hide ${name}`, role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { label: `Quit ${name}`, role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  setMenu(); // Set menu FIRST before window is created

  if (process.platform === 'darwin' && app.dock && fs.existsSync(ICON)) {
    try { app.dock.setIcon(ICON); } catch (e) { console.warn('dock icon:', e.message); }
  }
  if (process.platform === 'darwin') {
    await systemPreferences.askForMediaAccess('camera');
    await systemPreferences.askForMediaAccess('microphone');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function createWindow() {
  win = new BrowserWindow({
    show: false,
    fullscreen: true,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    icon: ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => {
    cb(['media', 'camera', 'microphone', 'display-capture'].includes(permission));
  });

  win.loadFile('index.html');
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/* ── IPC: pick folder ─────────────────────────────────────────────────────── */
const IMAGE_EXTS = new Set(['jpg','jpeg','png','gif','webp','bmp']);

ipcMain.handle('choose-dir', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Choose Folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (r.canceled) return null;
  const dir = r.filePaths[0];
  const tracks = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const wavFiles = new Set(
      entries.filter(e => e.isFile() && e.name.endsWith('_audio.wav')).map(e => e.name)
    );

    // ── Video tracks ──────────────────────────────────────────────────────────
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = e.name.split('.').pop().toLowerCase();
      if (!VIDEO_EXTS.has(ext)) continue;
      // Extract track slot from "track_N_video.ext" naming convention (optional)
      const m = e.name.match(/^track_(\d+)_video\./);
      const trackIdx = m ? parseInt(m[1], 10) : null;
      const videoPath = path.join(dir, e.name);
      const audioName = e.name.replace(/_video\.[^.]+$/, '_audio.wav');
      const audioPath = wavFiles.has(audioName) ? path.join(dir, audioName) : null;
      tracks.push({ videoPath, audioPath, imagePath: null, trackIdx });
    }

    // ── Image tracks ──────────────────────────────────────────────────────────
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = e.name.split('.').pop().toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      // Only pick up files saved by the app: track_N_image.ext
      const m = e.name.match(/^track_(\d+)_image\./);
      if (!m) continue;
      const trackIdx = parseInt(m[1], 10);
      const imagePath = path.join(dir, e.name);
      tracks.push({ videoPath: null, audioPath: null, imagePath, trackIdx });
    }

    // Sort by slot index so tracks land in the right cards on reload
    tracks.sort((a, b) => (a.trackIdx ?? 999) - (b.trackIdx ?? 999));
    if (tracks.length > 12) tracks.length = 12;

  } catch (err) { console.error('dir scan:', err); }
  return { dir, tracks };
});

/* ── IPC: convert video to mp4 if needed ─────────────────────────────────── */
ipcMain.handle('convert-if-needed', async (_e, srcPath) => {
  const ext = srcPath.split('.').pop().toLowerCase();
  if (NATIVE_EXTS.has(ext)) return { path: srcPath, converted: false };

  const outPath = srcPath.replace(/\.[^.]+$/, '_converted.mp4');
  if (fs.existsSync(outPath)) return { path: outPath, converted: false };

  return new Promise((resolve) => {
    execFile(FFMPEG, [
      '-i', srcPath,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
      '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      '-y', outPath
    ], (err) => {
      if (err) {
        console.error('ffmpeg convert error:', err.message);
        resolve({ path: srcPath, converted: false, error: err.message });
      } else {
        resolve({ path: outPath, converted: true });
      }
    });
  });
});

/* ── IPC: save file ──────────────────────────────────────────────────────── */
ipcMain.handle('save-file', async (_e, filePath, arrayBuffer) => {
  try {
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
});

/* ── IPC: read file ──────────────────────────────────────────────────────── */
ipcMain.handle('read-file', async (_e, filePath) => {
  try {
    const buf = fs.readFileSync(filePath);
    const ab = new ArrayBuffer(buf.length);
    new Uint8Array(ab).set(buf);
    return ab;
  } catch { return null; }
});

/* ── IPC: path join ──────────────────────────────────────────────────────── */
ipcMain.handle('path-join', (_e, ...parts) => path.join(...parts));

/* ── IPC: ensure directory exists ───────────────────────────────────────── */
ipcMain.handle('ensure-dir', async (_e, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
});

