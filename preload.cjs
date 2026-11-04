const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("ordenandoApp", {
  platform: "windows"
});
