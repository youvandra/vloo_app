import Mnee from '@mnee/ts-sdk';

// TODO: Move API Key to environment variables
const MNEE_API_KEY = process.env.EXPO_PUBLIC_MNEE_API_KEY || '9ab1ca00af991b1745fb8f21e4a480f1';
const MNEE_ENV = (process.env.EXPO_PUBLIC_MNEE_ENV as 'sandbox' | 'production') || 'sandbox';

const config = {
  environment: MNEE_ENV,
  apiKey: MNEE_API_KEY,
};

// Initialize MNEE SDK
const mnee = new Mnee(config);

/**
 * Fetch MNEE balance for a given Bitcoin address
 * @param address Bitcoin address
 * @returns Balance string (e.g., "100 MNEE")
 */
export const fetchMneeBalance = async (address: string): Promise<string> => {
    try {
        console.log(`Fetching MNEE balance for ${address}...`);
        const balance = await mnee.balance(address);
        console.log('MNEE Balance:', balance);
        
        // Handle object response: {"address": "...", "amount": 0, "decimalAmount": 0}
        if (typeof balance === 'object' && balance !== null && 'decimalAmount' in balance) {
            return `${(balance as any).decimalAmount} MNEE`;
        }
        
        return `${balance} MNEE`;
    } catch (error) {
        console.error('Error fetching MNEE balance:', error);
        return "0 MNEE";
    }
};

/**
 * Check MNEE Configuration (for debugging)
 */
export const checkMneeConfig = async () => {
    try {
        const mneeConfig = await mnee.config();
        console.log('MNEE Configuration:', mneeConfig);
        return mneeConfig;
    } catch (error) {
        console.error('Error checking MNEE config:', error);
        return null;
    }
};

export interface MneeRecipient {
    address: string;
    amount: number;
}

/**
 * Transfer MNEE to recipients
 * @param recipients Array of recipients with address and amount
 * @param wif Sender's WIF key
 * @returns Transfer response containing ticketId
 */
export const transferMnee = async (recipients: MneeRecipient[], wif: string) => {
    try {
        console.log('Initiating MNEE transfer...', recipients);
        const response = await mnee.transfer(recipients, wif);
        console.log('MNEE Transfer response:', response);
        return response;
    } catch (error) {
        console.error('Error transferring MNEE:', error);
        throw error;
    }
};

/**
 * Get status of an MNEE transaction
 * @param ticketId The ticket ID returned from transfer
 * @returns Transaction status
 */
export const getMneeTxStatus = async (ticketId: string) => {
    try {
        const status = await mnee.getTxStatus(ticketId);
        console.log('MNEE Tx Status:', status);
        return status;
    } catch (error) {
        console.error('Error fetching MNEE tx status:', error);
        throw error;
    }
};

/**
 * Get recent transaction history for an address
 * @param address The wallet address
 * @returns History object containing address, history array, and nextScore
 */
export const getMneeHistory = async (address: string) => {
    try {
        console.log(`Fetching MNEE history for ${address}`);
        const history = await mnee.recentTxHistory(address);
        console.log('MNEE History:', history);
        return history;
    } catch (error) {
        console.error('Error fetching MNEE history:', error);
        throw error;
    }
};

export default mnee;
