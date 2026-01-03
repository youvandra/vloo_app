
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

export const generateDeterministicPrivateKey = (cardId: string, passphrase: string): string => {
  // Use PBKDF2 (Password-Based Key Derivation Function 2)
  // This is the industry standard for deriving keys from passwords.
  
  const salt = `${cardId}`;
  const iterations = 10000;
  const keySize = 256 / 32;

  const derivedKey = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: keySize,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256
  });

  return derivedKey.toString(CryptoJS.enc.Hex);
};

export const generateCommitmentHash = (cardId: string, passphrase: string): string => {
  // Generate a hash to lock the card to this passphrase on the server
  // This is NOT the private key and cannot be used to derive it.
  const input = `${cardId}:${passphrase}:VERIFY`;
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
};
