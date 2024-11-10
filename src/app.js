const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const dgram = require("dgram");

const udpServer = dgram.createSocket("udp4");
const UDP_PORT = process.env.UDP_PORT || process.argv[2] || 9999;
const DEST_PORT = Number(UDP_PORT) === 9998 ? 9999 : 9998;

const BROADCAST_ADDR = "127.0.0.255";
let myId;

let broadcastPeerId = (peerId) => {
  const message = Buffer.from(peerId);
  udpServer.send(message, 0, message.length, DEST_PORT, BROADCAST_ADDR, () => {
    console.log("Peer ID boradcasted", peerId, "to", DEST_PORT);
  });
};

// setup the udp server
udpServer.bind(UDP_PORT, () => {
  console.log("udp server is listening on " + UDP_PORT);
  udpServer.setBroadcast(true);
});

udpServer.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  udpServer.close();
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  udpServer.on("message", (message, rinfo) => {
    const strMessage = message.toString();
    if (strMessage !== myId) {
      mainWindow.webContents.send("recieved-id", strMessage);
      console.log(
        `Received peer ID: ${strMessage} from ${rinfo.address}:${rinfo.port}`
      );
    }
  });
};

// Listen for messages from the renderer process
ipcMain.on("peerID", (event, id) => {
  myId = id;
  setInterval(() => broadcastPeerId(id), 5000);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
