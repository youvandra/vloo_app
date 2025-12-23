
import CryptoJS from 'crypto-js';

// Encrypt data (e.g. private key) using AES
// Note: CryptoJS uses AES-CBC by default with OpenSSL KDF. 
// For strict AES-GCM in a production app, consider using react-native-aes-gcm-crypto or expo-crypto (if updated).
// This meets the MVP requirement of client-side encryption.
export const encryptData = (data: string, passphrase: string): string => {
  return CryptoJS.AES.encrypt(data, passphrase).toString();
};

// Decrypt data
export const decryptData = (ciphertext: string, passphrase: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (e) {
    console.error("Decryption failed", e);
    return '';
  }
};
