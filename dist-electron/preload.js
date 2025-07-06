"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("database", {
  // Add database methods here when needed
});
