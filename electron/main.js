const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')

let mainWindow = null

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 780,
    minWidth: 380,
    maxWidth: 600,
    title: '记账本',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#f0f9ff',
  })

  mainWindow.loadURL(url)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

// Static file server for production
function startFileServer(staticDir, port) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
  }

  const server = http.createServer((req, res) => {
    let filePath = path.join(staticDir, req.url === '/' ? 'index.html' : req.url)

    // Try the path as-is, then try index.html, then fallback to /index.html for SPA
    const tryPaths = [filePath]
    if (!path.extname(filePath)) {
      tryPaths.push(path.join(filePath, 'index.html'))
    }
    tryPaths.push(path.join(staticDir, 'index.html'))

    for (const fp of tryPaths) {
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        const ext = path.extname(fp)
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
        fs.createReadStream(fp).pipe(res)
        return
      }
    }

    res.writeHead(404)
    res.end('Not Found')
  })

  server.listen(port)
  return server
}

app.whenReady().then(() => {
  const isDev = !app.isPackaged

  if (isDev) {
    // In dev, wait for Next.js dev server then load
    const tryConnect = () => {
      http.get('http://localhost:3000', () => {
        createWindow('http://localhost:3000')
      }).on('error', () => {
        setTimeout(tryConnect, 1000)
      })
    }
    tryConnect()
  } else {
    // Production: serve static export
    const staticDir = path.join(process.resourcesPath, 'app', 'out')
    // Fallback to development out/ if resourcesPath doesn't exist
    const devOut = path.join(__dirname, '..', 'out')
    const finalDir = fs.existsSync(staticDir) ? staticDir : (fs.existsSync(devOut) ? devOut : null)

    if (!finalDir) {
      console.error('Static files not found. Run "npm run build" first.')
      app.quit()
      return
    }

    const server = startFileServer(finalDir, 0)
    const port = server.address().port
    createWindow(`http://localhost:${port}`)
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (!mainWindow) {
    const isDev = !app.isPackaged
    createWindow(isDev ? 'http://localhost:3000' : 'http://localhost:3456')
  }
})
