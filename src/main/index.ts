import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/zoominfo.png?asset'
import TrayGenerator from '../helpers/TrayGenerator'
import ElectronStore from 'electron-store'
import { Target } from '../models'

const schema: Record<string, unknown> = {
  launchAtStart: true
}

const store = new ElectronStore(schema)

let mainWindow: BrowserWindow

function createMainWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 460,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      devTools: is.dev,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow()

  const Tray = new TrayGenerator(mainWindow, store)
  Tray.createTray()

  app.setLoginItemSettings({
    openAtLogin: store.get('launchAtStart') === 'true'
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    if (!store.has('environments')) {
      store.set('environments', [])
    }
    if (!store.has('targets')) {
      store.set('targets', {})
    }
    mainWindow.webContents.send('store:load', store.store)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
// store.clear()
app.dock.hide()
console.log('🚀 DOZI ~ store.store:', JSON.stringify(store.store, null, 2))

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('target:added', (event, { target, env }) => {
  const storyKey = `targets.${env}`
  const prevTargets = (store.get(storyKey) || []) as string[]

  store.set(storyKey, [...prevTargets, { ...target, notifyChanges: true }])

  console.log('🚀 DOZI ~ ipcMain.on ~ target:added:', store.store)
  event.reply('store:load', store.store)
})

ipcMain.on('target:deleted', (event, { item, selectedEnv }) => {
  const storyKey = `targets.${selectedEnv}`
  const prevTargets = store.get<string>(storyKey) as Target[]

  store.set(
    storyKey,
    prevTargets.filter((t) => t.name !== item.name)
  )

  console.log('🚀 DOZI ~ ipcMain.on ~ target:deleted:', store.store)
  event.reply('store:load', store.store)
})

ipcMain.on('tags:updated', (event, tags) => {
  const existingTags: string[] = store.get('environments') as string[]
  for (const eTag of existingTags) {
    if (!tags.includes(eTag)) {
      store.delete(`targets.${eTag}`)
    }
  }
  store.set('environments', tags)

  event.reply('store:load', store.store)
})

ipcMain.on('notify:updated', (event, { item, selectedEnv }) => {
  const storyKey = `targets.${selectedEnv}`
  const selectedEnvTargets = store.get(storyKey) as Target[]
  const updatedTargets = selectedEnvTargets.map((target) => {
    if (target.name !== item.name) {
      return target
    }

    return { ...target, notifyChanges: !item.notifyChanges }
  })

  store.set(storyKey, updatedTargets)

  event.reply('store:load', store.store)
})
