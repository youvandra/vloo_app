# VLOO — Card-Based Wallet & Gifting App for Everyday MNEE Payments

## Project Overview

VLOO is a **multi-chain, non-custodial wallet and gifting application** designed to make crypto usable for everyday payments by non-crypto users.

While most crypto wallets focus on asset storage, trading, or DeFi, VLOO focuses on **real-world usage**:
- daily payments
- salary distribution
- gifting
- scheduled transfers
- trustless value transfer without custodians

VLOO combines:
- a **mobile wallet application** (React Native / Expo)
- **deterministic wallet generation**
- **MNEE as the primary payment asset**
- and a future-ready **card-based access model**

The result is a crypto wallet that feels closer to a **digital payment app** than a traditional blockchain wallet.

---

## Purpose

The biggest barrier to crypto adoption is not blockchain scalability or cryptography — it is **usability**.

In emerging markets, most users interact with crypto only through:
- centralized exchanges
- speculative trading
- passive holding

Crypto rarely functions as an **everyday payment tool**, even though it was designed for trustless peer-to-peer transactions.

This happens because of two structural problems:

### 1. Most crypto assets are unsuitable for daily payments
Popular assets like Bitcoin and Ethereum are:
- volatile
- dependent on gas fees
- slow or unpredictable in settlement
- impractical for small, frequent transactions

### 2. Wallet UX is hostile to non-crypto users
Non-technical users are blocked by:
- 12/24-word seed phrases
- private key management
- manual backups
- irreversible loss due to simple mistakes

For most people, this complexity is a deal-breaker.

---

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Thirdparty API**: [Coingecko](https://www.coingecko.com/) (Coingecko)
- **Language**: TypeScript
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Navigation**: React Navigation (Stack)
- **Blockchain SDKs**:
  - `@mnee/ts-sdk`: MNEE network interaction
  - `bitcoinjs-lib`: Bitcoin wallet operations
  - `ethers`: Ethereum/EVM chain interactions
  - `@solana/web3.js`: Solana integration
  - `@hashgraph/sdk`: Hedera support
- **UI Components**: `lucide-react-native`, `@react-native-community/datetimepicker`

## 📂 Project Structure

```
vloo_mvp-app/
├── migrations/          # SQL migrations for Supabase
├── src/
│   ├── assets/          # Images and Icons
│   ├── components/      # Reusable UI components (Buttons, Cards, Inputs)
│   ├── lib/             # Core logic and utilities
│   │   ├── crypto.ts    # Cryptographic functions
│   │   ├── mnee.ts      # MNEE SDK wrapper
│   │   ├── supabase.ts  # Supabase client
│   │   ├── wallet.ts    # Wallet generation logic
│   │   └── theme.ts     # Design tokens (Colors, Fonts)
│   ├── navigation/      # App navigation configuration
│   └── screens/         # Application screens
│       ├── giver/       # Giver flow screens (Dashboard, Transfer, etc.)
│       └── HomeScreen.tsx
├── App.js               # Entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase Account](https://supabase.com/) (for backend)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd vloo_mvp-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory (if not already present) and add your API keys:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_MNEE_API_KEY=your_mnee_api_key
    EXPO_PUBLIC_MNEE_ENV=sandbox
    ```

4.  **Database Setup**
    Run the SQL scripts located in the `migrations/` folder on your Supabase SQL editor to set up the database schema and policies.

### Running the App

Start the Expo development server:

```bash
npm start
```

- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator.
- Press `w` to run on Web.
- Scan the QR code with the **Expo Go** app on your physical device.

## Judges Test
ID: 2
Passphrase: 2

## 🗓 Scheduled Transfers

The app supports scheduling MNEE transfers. This feature allows users to:
1.  Select "Schedule" mode in the Transfer screen.
2.  Pick a future date and time.
3.  Enter recipients and amounts.
4.  Confirm to save the scheduled task (backend integration pending).

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
