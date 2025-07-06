import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('database', {
  // Add database methods here when needed
})
