import { encrypt, decrypt, hash, generateEncryptionKey, isCryptoAvailable, type EncryptedData } from './crypto'
import { createSecureCookieStorage, type SecureCookieStorage } from './cookie-storage'

export interface SecureStorageConfig {
  storageType?: 'cookie' | 'memory' | 'localStorage'
  encryptionEnabled?: boolean
  encryptionPassword?: string
  cookieDomain?: string
  prefix?: string
}

export interface SecureStorageItem {
  value: string | EncryptedData
  encrypted: boolean
  expires?: number
  metadata?: Record<string, any>
}

class SecureStorageImpl {
  private config: Required<SecureStorageConfig>
  private storage: SecureCookieStorage | Storage | Map<string, string>
  private encryptionKey: string | null = null
  
  constructor(config: SecureStorageConfig = {}) {
    this.config = {
      storageType: config.storageType || 'cookie',
      encryptionEnabled: config.encryptionEnabled ?? true,
      encryptionPassword: config.encryptionPassword || '',
      cookieDomain: config.cookieDomain || '',
      prefix: config.prefix || 'sasarjan-secure'
    }
    
    // Initialize storage backend
    switch (this.config.storageType) {
      case 'cookie':
        this.storage = createSecureCookieStorage(this.config.prefix, {
          domain: this.config.cookieDomain || undefined
        })
        break
      case 'localStorage':
        if (typeof window !== 'undefined') {
          this.storage = window.localStorage
        } else {
          this.storage = new Map()
        }
        break
      case 'memory':
        this.storage = new Map()
        break
    }
    
    // Initialize encryption if enabled
    if (this.config.encryptionEnabled && !this.config.encryptionPassword) {
      this.initializeEncryptionKey()
    }
  }
  
  private async initializeEncryptionKey(): Promise<void> {
    // Try to get existing key from environment
    if (typeof process !== 'undefined' && process.env?.ENCRYPTION_KEY) {
      this.encryptionKey = process.env.ENCRYPTION_KEY
      return
    }
    
    // Generate a new key if none exists
    const keyName = `${this.config.prefix}-encryption-key`
    let existingKey: string | null = null
    
    if (this.storage instanceof Map) {
      existingKey = this.storage.get(keyName) || null
    } else if ('getItem' in this.storage) {
      existingKey = this.storage.getItem(keyName)
    }
    
    if (!existingKey) {
      // Generate new encryption key
      this.encryptionKey = await generateEncryptionKey(256)
      
      // Store it (this is only secure in cookie storage with httpOnly)
      if (this.storage instanceof Map) {
        this.storage.set(keyName, this.encryptionKey)
      } else if ('setItem' in this.storage) {
        this.storage.setItem(keyName, this.encryptionKey)
      }
    } else {
      this.encryptionKey = existingKey
    }
  }
  
  private getEncryptionPassword(): string {
    return this.config.encryptionPassword || this.encryptionKey || 'default-encryption-key'
  }
  
  private getStorageKey(key: string): string {
    return `${this.config.prefix}-${key}`
  }
  
  async setItem(
    key: string,
    value: any,
    options?: {
      encrypt?: boolean
      expires?: number
      metadata?: Record<string, any>
    }
  ): Promise<void> {
    const shouldEncrypt = options?.encrypt ?? this.config.encryptionEnabled
    const storageKey = this.getStorageKey(key)
    
    let storageItem: SecureStorageItem
    
    if (shouldEncrypt && isCryptoAvailable()) {
      // Encrypt the value
      const plaintext = typeof value === 'string' ? value : JSON.stringify(value)
      const encryptedData = await encrypt(plaintext, this.getEncryptionPassword())
      
      storageItem = {
        value: encryptedData,
        encrypted: true,
        expires: options?.expires,
        metadata: options?.metadata
      }
    } else {
      // Store as plain text
      storageItem = {
        value: typeof value === 'string' ? value : JSON.stringify(value),
        encrypted: false,
        expires: options?.expires,
        metadata: options?.metadata
      }
    }
    
    const serialized = JSON.stringify(storageItem)
    
    // Store in the appropriate backend
    if (this.storage instanceof Map) {
      this.storage.set(storageKey, serialized)
    } else if ('setItem' in this.storage) {
      if (this.config.storageType === 'cookie' && options?.expires) {
        // For cookies, use the expires option
        (this.storage as SecureCookieStorage).setItem(storageKey, serialized, {
          maxAge: options.expires
        })
      } else {
        this.storage.setItem(storageKey, serialized)
      }
    }
  }
  
  async getItem(key: string): Promise<any | null> {
    const storageKey = this.getStorageKey(key)
    
    // Get from storage backend
    let serialized: string | null = null
    
    if (this.storage instanceof Map) {
      serialized = this.storage.get(storageKey) || null
    } else if ('getItem' in this.storage) {
      serialized = this.storage.getItem(storageKey)
    }
    
    if (!serialized) return null
    
    try {
      const storageItem: SecureStorageItem = JSON.parse(serialized)
      
      // Check expiration
      if (storageItem.expires && Date.now() > storageItem.expires) {
        await this.removeItem(key)
        return null
      }
      
      // Decrypt if necessary
      if (storageItem.encrypted && isCryptoAvailable()) {
        const decrypted = await decrypt(
          storageItem.value as EncryptedData,
          this.getEncryptionPassword()
        )
        
        // Try to parse as JSON
        try {
          return JSON.parse(decrypted)
        } catch {
          return decrypted
        }
      } else {
        // Return plain value
        const value = storageItem.value as string
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error)
      return null
    }
  }
  
  async removeItem(key: string): Promise<void> {
    const storageKey = this.getStorageKey(key)
    
    if (this.storage instanceof Map) {
      this.storage.delete(storageKey)
    } else if ('removeItem' in this.storage) {
      (this.storage as Storage | SecureCookieStorage).removeItem(storageKey)
    }
  }
  
  async clear(): Promise<void> {
    if (this.storage instanceof Map) {
      // Clear only our prefixed keys
      const keysToDelete: string[] = []
      this.storage.forEach((_, key) => {
        if (key.startsWith(this.config.prefix)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => (this.storage as Map<string, string>).delete(key))
    } else if (this.storage && 'clear' in this.storage) {
      if (this.config.storageType === 'cookie' && 'clear' in this.storage) {
        // For cookies, we need to clear selectively
        (this.storage as SecureCookieStorage).clear()
      } else if ('removeItem' in this.storage) {
        // For localStorage, clear only our prefixed keys
        const keysToDelete: string[] = []
        const localStorage = this.storage as Storage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.config.prefix)) {
            keysToDelete.push(key)
          }
        }
        keysToDelete.forEach(key => localStorage.removeItem(key))
      }
    }
  }
  
  // Hash-based key derivation for consistent keys
  async deriveKey(input: string): Promise<string> {
    if (!isCryptoAvailable()) {
      // Fallback to simple hash
      let hash = 0
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(36)
    }
    
    const hashed = await hash(input)
    return hashed.substring(0, 32) // Use first 32 chars
  }
  
  // Secure comparison for sensitive data
  async secureCompare(stored: string, provided: string): Promise<boolean> {
    if (!isCryptoAvailable()) {
      return stored === provided
    }
    
    const [storedHash, providedHash] = await Promise.all([
      hash(stored),
      hash(provided)
    ])
    
    return storedHash === providedHash
  }
  
  // Get all keys with a specific prefix
  async getKeys(prefix?: string): Promise<string[]> {
    const keys: string[] = []
    const searchPrefix = this.getStorageKey(prefix || '')
    
    if (this.storage instanceof Map) {
      this.storage.forEach((_, key) => {
        if (key.startsWith(searchPrefix)) {
          keys.push(key.replace(this.config.prefix + '-', ''))
        }
      })
    } else if (this.storage && typeof this.storage === 'object' && 'length' in this.storage) {
      const localStorage = this.storage as Storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(searchPrefix)) {
          keys.push(key.replace(this.config.prefix + '-', ''))
        }
      }
    }
    
    return keys
  }
  
  // Batch operations for efficiency
  async setItems(items: Record<string, any>, options?: Parameters<typeof this.setItem>[2]): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => 
        this.setItem(key, value, options)
      )
    )
  }
  
  async getItems(keys: string[]): Promise<Record<string, any>> {
    const results = await Promise.all(
      keys.map(key => this.getItem(key))
    )
    
    const items: Record<string, any> = {}
    keys.forEach((key, index) => {
      if (results[index] !== null) {
        items[key] = results[index]
      }
    })
    
    return items
  }
}

// Export type alias
export type SecureStorage = SecureStorageImpl

// Factory function for easy creation
export function createSecureStorage(config?: SecureStorageConfig): SecureStorage {
  return new SecureStorageImpl(config)
}

// Singleton instances for common use cases
let defaultSecureStorage: SecureStorage | null = null

export function getSecureStorage(config?: SecureStorageConfig): SecureStorage {
  if (!defaultSecureStorage) {
    defaultSecureStorage = new SecureStorageImpl(config)
  }
  return defaultSecureStorage
}

export function destroySecureStorage(): void {
  defaultSecureStorage = null
}