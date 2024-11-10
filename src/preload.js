// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("peerID", {
  sendID: (id) => ipcRenderer.send("peerID", id),
  onReception: (callback) =>
    ipcRenderer.on("recieved-id", (event, id) => callback(id)),
});
