
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';

// Create a new random wallet
export const createRandomWallet = () => {
  return ethers.Wallet.createRandom();
};

// Get wallet instance from private key
export const getWalletFromPrivateKey = (privateKey: string) => {
  return new ethers.Wallet(privateKey);
};

// Mock Bitcoin Address Generator
export const generateMockBitcoinData = () => {
  // Generates a random string that looks like a Bech32 Bitcoin address
  const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let address = 'bc1q';
  for (let i = 0; i < 38; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Mock private key (WIF format style - 52 chars, starts with K or L)
  const hexChars = '0123456789ABCDEF';
  let privateKey = 'L';
  for (let i = 0; i < 51; i++) {
    privateKey += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }

  return { address, privateKey };
};

// Mock Solana Address Generator
export const generateMockSolanaData = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Mock private key (Base58 style)
  let privateKey = '';
  for (let i = 0; i < 88; i++) {
    privateKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return { address, privateKey };
};
