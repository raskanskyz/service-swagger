import {
  Tray,
  Menu,
  BrowserWindow,
  MenuItem,
  MenuItemConstructorOptions,
  nativeImage
} from 'electron'
import icon from '../../resources/zoominfo.png?asset'

export default class TrayGenerator {
  tray: Tray | null
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.tray = null
    this.mainWindow = mainWindow
  }
  getWindowPosition = (): { x: number; y: number } => {
    const windowBounds = this.mainWindow.getBounds()
    const trayBounds = this.tray!.getBounds()
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
    const y = Math.round(trayBounds.y + trayBounds.height)
    return { x, y }
  }
  showWindow = (): void => {
    const position = this.getWindowPosition()
    this.mainWindow.setPosition(position.x, position.y, false)
    this.mainWindow.show()
    this.mainWindow.setVisibleOnAllWorkspaces(true)
    this.mainWindow.focus()
    this.mainWindow.setVisibleOnAllWorkspaces(false)
  }
  toggleWindow = (): void => {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.showWindow()
    }
  }
  rightClickMenu = (): void => {
    const menu: (MenuItemConstructorOptions | MenuItem)[] = [
      {
        role: 'quit',
        accelerator: 'Command+Q'
      }
    ]
    this.tray!.popUpContextMenu(Menu.buildFromTemplate(menu))
  }
  createTray = (): void => {
    this.tray = new Tray(nativeImage.createFromPath(icon))
    this.tray.setIgnoreDoubleClickEvents(true)
    this.tray.on('click', this.toggleWindow)
    this.tray.on('right-click', this.rightClickMenu)
  }
}
