
export type VlooStatus = 'locked' | 'ready' | 'claimed';

export interface WalletInfo {
  type: 'Ethereum' | 'Bitcoin';
  address: string;
}

export interface EncryptedKeys {
  ethereum: string;
  bitcoin?: string;
}

export interface Vloo {
  id: string;
  created_at: string;
  encrypted_private_key: EncryptedKeys; // Changed to object
  wallet_address: WalletInfo[]; // Changed to array of objects
  status: VlooStatus;
  receiver_name?: string;
}

export interface Card {
  id: string; // NFC UID
  vloo_id: string;
  created_at: string;
  name?: string;
}
