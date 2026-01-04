import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import '@ethersproject/shims';
import { ethers } from 'ethers';
import * as Bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import CryptoJS from 'crypto-js';
import { AccountId, PrivateKey as HederaPrivateKey } from '@hashgraph/sdk';

const ECPair = ECPairFactory(ecc);

// Helper to ensure seed is 32 bytes Buffer
const getSeedBuffer = (seed?: string): Buffer | undefined => {
  if (!seed) return undefined;
  // If seed is hex string
  if (seed.length >= 64) {
      return Buffer.from(seed.slice(0, 64), 'hex');
  }
  // If seed is shorter, hash it to get 32 bytes
  const hash = CryptoJS.SHA256(seed).toString(CryptoJS.enc.Hex);
  return Buffer.from(hash, 'hex');
};

// Create a new random wallet (EVM)
export const createRandomWallet = () => {
  return ethers.Wallet.createRandom();
};

// Get wallet instance from private key (EVM)
export const getWalletFromPrivateKey = (privateKey: string) => {
  return new ethers.Wallet(privateKey);
};

// --- Real Wallet Generators ---

// Bitcoin (SegWit p2wpkh)
export const generateBitcoinWallet = (seed?: string) => {
  const network = Bitcoin.networks.bitcoin;
  let keyPair;
  
  if (seed) {
      const seedBuf = getSeedBuffer(seed);
      keyPair = ECPair.fromPrivateKey(seedBuf!, { network });
  } else {
      keyPair = ECPair.makeRandom({ network });
  }

  const { address } = Bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
  const privateKey = keyPair.toWIF();
  
  return { address: address || '', privateKey };
};

// Solana
export const generateSolanaWallet = (seed?: string) => {
  let keypair;
  if (seed) {
      const seedBuf = getSeedBuffer(seed);
      // Solana keys are Ed25519. Seed must be 32 bytes.
      keypair = Keypair.fromSeed(Uint8Array.from(seedBuf!));
  } else {
      keypair = Keypair.generate();
  }
  
  const address = keypair.publicKey.toBase58();
  // Secret key is 64 bytes (seed + pubkey), standard export is Base58 of full secret key
  const privateKey = bs58.encode(keypair.secretKey);
  
  return { address, privateKey };
};

// Tron
export const generateTronWallet = (seed?: string) => {
  // Tron uses secp256k1 (like Ethereum)
  let wallet;
  if (seed) {
      // If seed is passed, treat as private key
      wallet = new ethers.Wallet(seed);
  } else {
      wallet = ethers.Wallet.createRandom();
  }
  
  const privateKey = wallet.privateKey; // 0x...
  const signingKey = wallet._signingKey();
  const publicKey = signingKey.publicKey; // 0x04... (uncompressed usually) or 0x02/03 (compressed)
  
  // Ethers publicKey is usually compressed (33 bytes) or uncompressed (65 bytes).
  // We need uncompressed without prefix for Keccak256
  
  // For Tron:
  // 1. Get 64-byte public key (X, Y). Ethers 'computePublicKey' can give uncompressed.
  const uncompressed = ethers.utils.computePublicKey(publicKey, false);
  const uncompressedBytes = ethers.utils.arrayify(uncompressed); // 65 bytes (0x04 + X + Y)
  const rawPubKey = uncompressedBytes.slice(1); // 64 bytes
  
  // 2. Keccak256
  const hash = ethers.utils.keccak256(rawPubKey); // 0x...
  const hashBytes = ethers.utils.arrayify(hash);
  
  // 3. Last 20 bytes
  const last20 = hashBytes.slice(-20);
  
  // 4. Prepend 0x41
  const addressBytes = new Uint8Array(21);
  addressBytes[0] = 0x41;
  addressBytes.set(last20, 1);
  
  // 5. Base58Check
  const address = bs58check(addressBytes);
  
  return { address, privateKey };
};

// XRP
export const generateXrpWallet = (seed?: string) => {
  // XRP usually uses secp256k1 (or ed25519). We'll use secp256k1 for compatibility with same seed.
  let wallet;
  if (seed) {
      wallet = new ethers.Wallet(seed);
  } else {
      wallet = ethers.Wallet.createRandom();
  }
  
  const privateKey = wallet.privateKey;
  const publicKey = wallet._signingKey().publicKey; // Compressed 0x02/03... (33 bytes) is standard for XRP
  
  // 1. SHA256 of public key bytes
  const pubKeyBytes = ethers.utils.arrayify(publicKey); // 33 bytes
  const sha256Hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(pubKeyBytes));
  
  // 2. RIPEMD160 of SHA256
  const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash);
  
  // 3. Prepend 0x00 (Account ID)
  const ripemd160Bytes = Buffer.from(ripemd160Hash.toString(CryptoJS.enc.Hex), 'hex');
  const payload = new Uint8Array(21);
  payload[0] = 0x00;
  payload.set(ripemd160Bytes, 1);
  
  // 4. Base58Check with XRP Alphabet
  // XRP Alphabet: rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz
  const XRP_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
  const address = bs58check(payload, XRP_ALPHABET);
  
  return { address, privateKey };
};

import { getHederaAccountId, createHederaAccount } from './hedera';

// Hedera
export const generateHederaWallet = async (seed?: string) => {
  // We use ECDSA for compatibility with EVM seed
  let privateKey;
  if (seed) {
      privateKey = HederaPrivateKey.fromStringECDSA(seed);
  } else {
      privateKey = HederaPrivateKey.generateECDSA();
  }
  
  const pubKey = privateKey.publicKey;
  const evmAddress = pubKey.toEvmAddress(); // Returns string 0x...
  
  let address = evmAddress;
  
  // Attempt to resolve existing account ID
  // Note: Vloo MVP seems to target Testnet for development based on logs
  // We'll check Testnet first or both? 
  // For safety, let's assume Testnet prioritization for "new" accounts if we have operator keys
  // But for resolution, we check both.
  
  const isTestnet = true; // Defaulting to Testnet for creation logic in MVP
  
  if (seed) {
      // If importing, check both networks for an existing 0.0.xxx ID
      const mainnetId = await getHederaAccountId(evmAddress, false); 
      if (mainnetId) {
          address = mainnetId;
      } else {
          const testnetId = await getHederaAccountId(evmAddress, true);
          if (testnetId) {
              address = testnetId;
          }
      }
      // If neither found, address remains evmAddress (0x...)
      // This avoids the confusing 0.0.evm... alias format
  } else {
      // New wallet generation (no seed provided, random key)
      // Attempt to CREATE the account on Testnet if operator is configured
      // This gives the user a real 0.0.xxx ID immediately
      const newAccountId = await createHederaAccount(pubKey, true); // Testnet creation
      if (newAccountId) {
          address = newAccountId;
      }
  }
  
  return { address, privateKey: privateKey.toStringRaw() };
};

// Monero (Still Mock for now as it requires complex C++ bindings or heavy JS)
// But we can at least make it consistent if possible.
// For now, we will keep the deterministic mock generator but rename it to conform.
export const generateMoneroWallet = (seed?: string) => {
   // Placeholder for Monero
   // Re-implementing the mock logic here to ensure no regression if we can't do real Monero easily
   const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   
   // Helper for deterministic generation
    const getDeterministicString = (seed: string | undefined, length: number, charset: string, context: string) => {
      if (!seed) {
        let result = '';
        for (let i = 0; i < length; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      }
      
      let result = '';
      for (let i = 0; i < length; i++) {
        const hashInput = `${seed}_${context}_${i}`;
        const hash = ethers.utils.id(hashInput); // keccak256
        const byteVal = parseInt(hash.slice(-2), 16);
        result += charset.charAt(byteVal % charset.length);
      }
      return result;
    };

   let address = '4' + getDeterministicString(seed, 94, chars, 'xmr_addr');
   const hexChars = '0123456789abcdef';
   let privateKey = getDeterministicString(seed, 64, hexChars, 'xmr_key');
   return { address, privateKey };
};


// Helper: Base58Check Encoding
function bs58check(payload: Uint8Array, alphabet?: string): string {
  // 1. Double SHA256 of payload
  const sha1 = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(payload));
  const sha2 = CryptoJS.SHA256(sha1);
  const checksumHex = sha2.toString(CryptoJS.enc.Hex).slice(0, 8); // First 4 bytes (8 hex chars)
  const checksum = Buffer.from(checksumHex, 'hex');
  
  // 2. Append checksum
  const result = new Uint8Array(payload.length + 4);
  result.set(payload);
  result.set(checksum, payload.length);
  
  // 3. Base58 Encode
  if (alphabet) {
      // Use custom alphabet
      // bs58 library doesn't support custom alphabet easily in v4/5 without custom implementation
      // or using 'base-x' package.
      // Since we installed 'bs58', it uses standard bitcoin alphabet.
      // For XRP, we need custom.
      // If we don't have base-x, we might need to implement base58 encode manually for XRP or stick to mock/standard.
      // But wait, user wants REAL keys. XRP addresses are critical.
      // Let's assume standard Base58 for now OR try to use a simple base58 impl with alphabet.
      // Actually, 'bs58' default is BTC.
      if (alphabet !== '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz') {
           // Fallback or todo: implement custom base58
           // For MVP, if we can't do custom alphabet easily, maybe we skip XRP real address or use standard bs58 and hope? 
           // No, XRP addresses WON'T work with BTC alphabet.
           // I will implement a simple base58 encoder for XRP.
           return encodeBase58(result, alphabet);
      }
  }
  
  return bs58.encode(result);
}

function encodeBase58(buffer: Uint8Array, alphabet: string): string {
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; ++j) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map(d => alphabet[d]).join('');
}


