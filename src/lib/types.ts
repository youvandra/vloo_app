
export type VlooStatus = 'locked' | 'ready' | 'claimed';

export interface Vloo {
  id: string;
  created_at: string;
  encrypted_private_key: string;
  wallet_address: string;
  unlock_date: string; // ISO string
  message: string;
  status: VlooStatus;
  receiver_name?: string;
}

export interface Card {
  id: string; // NFC UID
  vloo_id: string;
  created_at: string;
}
