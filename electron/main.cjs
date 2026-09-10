/**
 * Electron Main Process.
 *
 * Next.js yerel sunucusunu arka planda başlatır ve Chromium BrowserWindow içinde
 * MyLoL Alt-Account Dashboard uygulamasını çalıştırır.
 *
 * @module electron/main
 */

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const { fork } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;
const isDev = !app.isPackaged;

/**
 * .env.local dosyasındaki ortam değişkenlerini okuyup process.env'e yükler.
 */
function loadEnvironmentVariables() {
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(process.resourcesPath, '.env.local'),
    path.join(app.getPath('userData'), '.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...rest] = trimmed.split('=');
            const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
            if (key && !process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        });
        break;
      } catch (err) {
        console.error('[Electron] .env.local okuma hatası:', err);
      }
    }
  }

  // Varsayılan fallback değerleri
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/';
  }
}

/**
 * Belirtilen portun boş olup olmadığını kontrol eder.
 *
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, '127.0.0.1');
  });
}

/**
 * 3000'den başlayarak kullanılabilir ilk boş portu bulur.
 *
 * @param {number} [startPort=3000]
 * @returns {Promise<number>}
 */
async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port += 1;
    if (port > 3100) break;
  }
  return port;
}

/**
 * Yerel sunucunun HTTP yanıtı verip vermediğini yoklar.
 *
 * @param {string} url - Test edilecek URL
 * @param {number} [timeoutMs=30000] - Maksimum bekleme süresi
 * @returns {Promise<boolean>}
 */
function waitForServer(url, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.setTimeout(1500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Sunucuya bağlanılamadı: ${url} (Zaman aşımı)`));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

/**
 * Next.js üretim sunucusunu child process olarak arka planda başlatır.
 *
 * @param {number} port - Sunucunun dinleyeceği port
 * @returns {Promise<void>}
 */
function startProductionServer(port) {
  return new Promise((resolve, reject) => {
    // Standalone sunucu yolları (hem unpacked app, asar.unpacked hem de standalone desteği)
    const possibleServerPaths = [
      path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
      path.join(process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone', 'server.js'),
      path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
      path.join(process.resourcesPath, '.next', 'standalone', 'server.js'),
    ];

    let serverScript = possibleServerPaths.find((p) => fs.existsSync(p));

    if (!serverScript) {
      return reject(new Error('Next.js standalone server.js bulunamadı! Lütfen önce yarn build çalıştırın.'));
    }

    console.log('[Electron] Next.js sunucusu başlatılıyor:', serverScript, 'Port:', port);

    const env = {
      ...process.env,
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    };

    serverProcess = fork(serverScript, [], {
      env,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      cwd: path.dirname(serverScript),
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`[Next.js Server] ${data}`.trim());
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Next.js Server Error] ${data}`.trim());
    });

    serverProcess.on('error', (err) => {
      console.error('[Electron] Sunucu başlatılamadı:', err);
      reject(err);
    });

    resolve();
  });
}

/**
 * Ana BrowserWindow penceresini oluşturur.
 *
 * @param {string} targetUrl - Yüklenecek web adresi
 */
function createMainWindow(targetUrl) {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#050e18',
    autoHideMenuBar: true,
    title: 'MyLoL – Alt-Account Dashboard',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#050e18',
      symbolColor: '#94a3b8',
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  // Tarayıcı sağ tık menüsünü engelle (Native masaüstü hissiyatı)
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Prod ortamında yanlışlıkla F5 veya Ctrl+R ile sayfa yenilenmesini engelle
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
        event.preventDefault();
      }
    });
  }

  // Harici linkleri kullanıcının varsayılan tarayıcısında aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.loadURL(targetUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Uygulama kapanırken çalışan temizlik fonksiyonu.
 */
function cleanup() {
  if (serverProcess) {
    try {
      console.log('[Electron] Arka plan sunucusu kapatılıyor...');
      serverProcess.kill('SIGINT');
      serverProcess = null;
    } catch (err) {
      console.error('[Electron] Sunucu kapatma hatası:', err);
    }
  }
}

// Uygulama yaşam döngüsü yöneticileri
app.whenReady().then(async () => {
  loadEnvironmentVariables();

  ipcMain.handle('ping', () => 'pong');

  let appUrl = 'http://localhost:3000';

  if (isDev) {
    console.log('[Electron] Dev modu devrede, http://localhost:3000 bekleniyor...');
    try {
      await waitForServer(appUrl, 15000);
    } catch (err) {
      console.warn('[Electron] 3000 hazır değil, yine de açılıyor...');
    }
  } else {
    try {
      const port = await findAvailablePort(3000);
      appUrl = `http://127.0.0.1:${port}`;
      await startProductionServer(port);
      await waitForServer(appUrl, 30000);
    } catch (err) {
      console.error('[Electron] Başlatma hatası:', err);
      // Hata durumunda bilgilendirme penceresi aç
      const errWindow = new BrowserWindow({ width: 500, height: 300, autoHideMenuBar: true });
      errWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <body style="font-family: sans-serif; background: #111; color: #fff; padding: 20px;">
          <h2 style="color: #f43f5e;">Başlatma Hatası</h2>
          <p>${err.message}</p>
          <p style="color: #94a3b8; font-size: 12px;">Lütfen önce 'yarn build' çalıştırıldığından emin olun.</p>
        </body>
      `)}`);
      return;
    }
  }

  createMainWindow(appUrl);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(appUrl);
    }
  });
});

app.on('before-quit', cleanup);
app.on('window-all-closed', () => {
  cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
