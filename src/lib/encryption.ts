import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    // If decryption fails or returns empty, assume it's already plaintext
    if (!decrypted) {
      return encryptedData
    }
    
    return decrypted
  } catch {
    // If decryption fails, assume it's already plaintext (existing data)
    return encryptedData
  }
}