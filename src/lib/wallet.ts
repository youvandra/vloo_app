
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

// Helper for deterministic generation
const getDeterministicString = (seed: string | undefined, length: number, charset: string, context: string) => {
  if (!seed) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
  
  // Deterministic
  let result = '';
  for (let i = 0; i < length; i++) {
    const hashInput = `${seed}_${context}_${i}`;
    const hash = ethers.utils.id(hashInput); // keccak256
    const byteVal = parseInt(hash.slice(-2), 16);
    result += charset.charAt(byteVal % charset.length);
  }
  return result;
};

// Mock Bitcoin Address Generator
export const generateMockBitcoinData = (seed?: string) => {
  // Generates a random string that looks like a Bech32 Bitcoin address
  const chars = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let address = 'bc1q' + getDeterministicString(seed, 38, chars, 'btc_addr');
  
  // Mock private key (WIF format style - 52 chars, starts with K or L)
  const hexChars = '0123456789ABCDEF';
  let privateKey = 'L' + getDeterministicString(seed, 51, hexChars, 'btc_key');

  return { address, privateKey };
};

// Mock Tron Address Generator
export const generateMockTronData = (seed?: string) => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = 'T' + getDeterministicString(seed, 33, chars, 'tron_addr');
  
  // Mock private key (Hex - 64 chars)
  const hexChars = '0123456789abcdef';
  let privateKey = getDeterministicString(seed, 64, hexChars, 'tron_key');
  
  return { address, privateKey };
};

// Mock XRP Address Generator
export const generateMockXrpData = (seed?: string) => {
  const chars = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz'; // Base58 XRP dictionary
  let address = 'r' + getDeterministicString(seed, 33, chars, 'xrp_addr');
  
  // Mock private key (Hex - 64 chars)
  const hexChars = '0123456789abcdef';
  let privateKey = getDeterministicString(seed, 64, hexChars, 'xrp_key');
  
  return { address, privateKey };
};

// Mock Hedera Address Generator
export const generateMockHederaData = (seed?: string) => {
  // Hedera addresses are typically like 0.0.123456
  // We will generate the account number part deterministically
  const accountNum = seed 
    ? parseInt(getDeterministicString(seed, 6, '0123456789', 'hedera_acc'), 10) 
    : Math.floor(Math.random() * 900000) + 100000;
    
  let address = `0.0.${accountNum}`;
  
  // Mock private key (Hex - 64 chars or 96 for ED25519, let's stick to 64 hex for consistency)
  const hexChars = '0123456789abcdef';
  let privateKey = getDeterministicString(seed, 64, hexChars, 'hedera_key');
  
  return { address, privateKey };
};

// Mock Monero Address Generator
export const generateMockMoneroData = (seed?: string) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let address = '4' + getDeterministicString(seed, 94, chars, 'xmr_addr');
  
  // Mock private key (Hex - 64 chars for spend key)
  const hexChars = '0123456789abcdef';
  let privateKey = getDeterministicString(seed, 64, hexChars, 'xmr_key');
  
  return { address, privateKey };
};

// Mock Solana Address Generator
export const generateMockSolanaData = (seed?: string) => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = getDeterministicString(seed, 44, chars, 'sol_addr');
  
  // Mock private key (Base58 style)
  let privateKey = getDeterministicString(seed, 88, chars, 'sol_key');
  
  return { address, privateKey };
};
