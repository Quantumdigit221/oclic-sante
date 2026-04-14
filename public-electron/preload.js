const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.version,
  versions: process.versions,
  
  // Methods for renderer to call
  showAboutDialog: () => ipcRenderer.invoke('show-about-dialog'),
  
  // App info
  getAppInfo: () => ({
    name: 'O\'CLIC SANTE',
    version: '1.0.0',
    description: 'Plateforme de gestion médicale complète'
  })
});

// Disable some features for security
window.addEventListener('DOMContentLoaded', () => {
  // Remove node integration
  delete window.require;
  delete window.exports;
  delete window.module;
});
