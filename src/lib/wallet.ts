
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
