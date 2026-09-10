/**
 * Electron Preload Script.
 *
 * Renderer process ile Main process arasında güvenli Context Bridge sağlar.
 *
 * @module electron/preload
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  isDesktop: true,
  ping: () => ipcRenderer.invoke('ping'),
});
