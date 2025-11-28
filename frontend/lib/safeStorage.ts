// Safe storage wrapper that detects localStorage availability
// and falls back to in-memory storage when sandboxed

const isStorageAvailable = (() => {
  if (typeof window === 'undefined') return false
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
})()

class SafeStorage {
  private _memory = new Map<string, string>()
  private _available = isStorageAvailable

  getItem(key: string): string | null {
    if (this._available) {
      try {
        return localStorage.getItem(key)
      } catch (e) {
        console.warn('localStorage.getItem failed, using memory:', e)
        this._available = false
      }
    }
    return this._memory.get(key) || null
  }

  setItem(key: string, value: string): void {
    if (this._available) {
      try {
        localStorage.setItem(key, value)
        return
      } catch (e) {
        console.warn('localStorage.setItem failed, using memory:', e)
        this._available = false
      }
    }
    this._memory.set(key, value)
  }

  removeItem(key: string): void {
    if (this._available) {
      try {
        localStorage.removeItem(key)
        return
      } catch (e) {
        console.warn('localStorage.removeItem failed, using memory:', e)
        this._available = false
      }
    }
    this._memory.delete(key)
  }

  clear(): void {
    if (this._available) {
      try {
        localStorage.clear()
        return
      } catch (e) {
        console.warn('localStorage.clear failed, using memory:', e)
        this._available = false
      }
    }
    this._memory.clear()
  }

  isAvailable(): boolean {
    return this._available
  }
}

export const storage = new SafeStorage()
