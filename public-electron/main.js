const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Keep a global reference of window object
let mainWindow;

function createWindow() {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/LOGO.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // Style moderne sur Windows
    show: false // Ne pas afficher immédiatement
  });

  // Load app
  const startUrl = `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create menu
function createMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Actualiser',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        {
          label: 'Plein écran',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'Zoom avant',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
          }
        },
        {
          label: 'Zoom arrière',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
          }
        },
        {
          label: 'Zoom par défaut',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'O\'CLIC SANTE',
              message: 'O\'CLIC SANTE v1.0.0\n\nPlateforme de gestion médicale complète',
              detail: ' 2024 O\'CLIC SANTE. Tous droits réservés.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  // Set app user model ID for Windows
  app.setAppUserModelId('com.oclicsante.app');

  // Handle protocol for deep linking
  app.setAsDefaultProtocolClient('oclic-sante');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors in development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
