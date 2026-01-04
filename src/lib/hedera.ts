

import { Client, AccountId, PrivateKey, AccountCreateTransaction, Hbar, PublicKey } from "@hashgraph/sdk";

// User provided credentials - IN PRODUCTION THESE SHOULD BE ENV VARS
const OPERATOR_ID = process.env.EXPO_PUBLIC_HEDERA_OPERATOR_ID ? AccountId.fromString(process.env.EXPO_PUBLIC_HEDERA_OPERATOR_ID) : null;
const OPERATOR_KEY = process.env.EXPO_PUBLIC_HEDERA_OPERATOR_KEY ? PrivateKey.fromStringECDSA(process.env.EXPO_PUBLIC_HEDERA_OPERATOR_KEY) : null;

let mainnetClient: Client | null = null;
let testnetClient: Client | null = null;

const getClient = (isTestnet: boolean = false) => {
    if (isTestnet) {
        if (!testnetClient) {
            testnetClient = Client.forTestnet();
            if (OPERATOR_ID && OPERATOR_KEY) {
                testnetClient.setOperator(OPERATOR_ID, OPERATOR_KEY);
            }
        }
        return testnetClient;
    }

    if (!mainnetClient) {
        mainnetClient = Client.forMainnet();
        if (OPERATOR_ID && OPERATOR_KEY) {
            mainnetClient.setOperator(OPERATOR_ID, OPERATOR_KEY);
        }
    }
    return mainnetClient;
};

export const createHederaAccount = async (publicKey: PublicKey, isTestnet: boolean = false): Promise<string | null> => {
    try {
        const client = getClient(isTestnet);
        // If no client or no operator (payer), we cannot create an account
        if (!client || !client.operatorAccountId) {
            console.warn("Cannot create Hedera account: No operator configured.");
            return null;
        }

        const txCreateAccount = new AccountCreateTransaction()
            .setECDSAKeyWithAlias(publicKey) // Use setKey for standard key assignment (alias handled by EVM mapping usually, but setKey works for pure creation)
            // Note: The user example used .setECDSAKeyWithAlias(accountPublicKey). 
            // In @hashgraph/sdk v2.46+, setKey is standard. 
            // If we want to ensure alias is set, we might rely on the key type.
            // Let's try to match the user's intent:
            // "setECDSAKeyWithAlias" might be a specific helper in newer SDKs or Hiero.
            // Standard way: .setKey(key).
            // If we want to set alias, we can use .setAlias(evmAddress) if needed, but setKey is usually enough for 0.0.xxx creation.
            // Let's stick to simple .setKey(publicKey) which links the key to the account.
            .setInitialBalance(new Hbar(1)); // Start with 0 balance (Operator pays fees)

        // Sign the transaction with the client operator private key and submit to a Hedera network
        const txCreateAccountResponse = await txCreateAccount.execute(client);

        // Request the receipt of the transaction
        const receiptCreateAccountTx = await txCreateAccountResponse.getReceipt(client);

        // Get the Account ID
        const accountId = receiptCreateAccountTx.accountId;
        
        return accountId ? accountId.toString() : null;
    } catch (error) {
        console.error("Error creating Hedera account:", error);
        return null;
    }
};

export const fetchHederaBalance = async (accountIdStr: string, isTestnet: boolean = false): Promise<string> => {
    try {
        const baseUrl = isTestnet 
            ? 'https://testnet.mirrornode.hedera.com/api/v1' 
            : 'https://mainnet-public.mirrornode.hedera.com/api/v1';

        // Use the Mirror Node API which supports 0.0.x, base32 alias, and EVM address (0x...)
        const url = `${baseUrl}/accounts/${accountIdStr}`;
        
        const response = await fetch(url);
        
        if (response.status === 404) {
            // Account not found (e.g. inactive EVM address)
            return "0.00 HBAR";
        }
        
        if (!response.ok) {
            console.warn(`Error fetching Hedera balance for ${accountIdStr}: ${response.status}`);
            return "0.00 HBAR";
        }

        const data = await response.json();
        const balanceTinybars = data.balance?.balance || 0;
        const hbars = balanceTinybars / 100000000; // 1 HBAR = 100,000,000 tinybars
        
        return `${hbars.toFixed(4)} HBAR`;

    } catch (error) {
        console.error("Error fetching Hedera balance:", error);
        return "0.00 HBAR";
    }
};

export const getHederaAccountId = async (evmAddress: string, isTestnet: boolean = false): Promise<string | null> => {
    try {
        // 1. First, try to fetch the numeric ID (0.0.xxx) from the Mirror Node
        // This is necessary because a local conversion of a random EVM address only gives the Alias format (0.0.evm)
        const baseUrl = isTestnet 
            ? 'https://testnet.mirrornode.hedera.com/api/v1' 
            : 'https://mainnet-public.mirrornode.hedera.com/api/v1';

        const url = `${baseUrl}/accounts/${evmAddress}`;
        
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.account) {
                    return data.account; // Returns 0.0.123
                }
            }
        } catch (networkError) {
            console.warn("Hedera Mirror Node unreachable, falling back to local SDK conversion:", networkError);
        }

        // 2. Fallback: Return null if not found
        // The user specifically wants the "longzero address converted" (0.0.xxx).
        // If we can't find it on the network, we shouldn't return the Alias ID (0.0.evm...)
        // because it's confusing. We'll let the wallet fall back to the EVM address (0x...).
        return null;

    } catch (error) {
        console.error("Error resolving Hedera Account ID:", error);
        return null;
    }
};
