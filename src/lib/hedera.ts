import { Client, AccountId, PrivateKey, AccountBalanceQuery } from "@hiero-ledger/sdk";

// User provided credentials - IN PRODUCTION THESE SHOULD BE ENV VARS
const OPERATOR_ID = AccountId.fromString(process.env.EXPO_PUBLIC_HEDERA_OPERATOR_ID || '');
const OPERATOR_KEY = PrivateKey.fromStringECDSA(process.env.EXPO_PUBLIC_HEDERA_OPERATOR_KEY || '');

let mainnetClient: Client | null = null;
let testnetClient: Client | null = null;

const getClient = (isTestnet: boolean = false) => {
    if (isTestnet) {
        if (!testnetClient) {
            testnetClient = Client.forTestnet();
            // Use operator if available, otherwise client might be read-only for some operations
            // Note: Mainnet credentials usually don't work on Testnet
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

export const fetchHederaBalance = async (accountIdStr: string, isTestnet: boolean = false): Promise<string> => {
    try {
        const client = getClient(isTestnet);
        
        // If the accountIdStr is not in 0.0.x format, it might be an EVM address or public key alias
        // For now, we assume it's a valid Hedera Account ID string (0.0.x)
        // If it's an EVM address, we might need different logic, but let's try to parse it.
        
        let accountId;
        try {
            accountId = AccountId.fromString(accountIdStr);
        } catch (e) {
            console.error("Invalid Hedera Account ID format:", accountIdStr);
            return "0.00 HBAR";
        }

        const query = new AccountBalanceQuery()
            .setAccountId(accountId);

        const accountBalance = await query.execute(client);
        
        // Hbars toString() usually returns "X ℏ" or similar, let's get the numeric value
        const hbars = accountBalance.hbars.toBigNumber().toNumber();
        
        return `${hbars.toFixed(4)} HBAR`;

    } catch (error) {
        console.error("Error fetching Hedera balance:", error);
        return "0.00 HBAR";
    }
};
