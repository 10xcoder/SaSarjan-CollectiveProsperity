interface SecureStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

export function createSecureStorage(prefix = 'sasarjan-auth'): SecureStorage {
  const isClient = typeof window !== 'undefined'
  
  return {
    getItem(key: string): string | null {
      if (!isClient) return null
      
      try {
        return localStorage.getItem(`${prefix}-${key}`)
      } catch (error) {
        console.warn('Error reading from storage:', error)
        return null
      }
    },

    setItem(key: string, value: string): void {
      if (!isClient) return
      
      try {
        localStorage.setItem(`${prefix}-${key}`, value)
      } catch (error) {
        console.warn('Error writing to storage:', error)
      }
    },

    removeItem(key: string): void {
      if (!isClient) return
      
      try {
        localStorage.removeItem(`${prefix}-${key}`)
      } catch (error) {
        console.warn('Error removing from storage:', error)
      }
    },

    clear(): void {
      if (!isClient) return
      
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(`${prefix}-`)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Error clearing storage:', error)
      }
    }
  }
}