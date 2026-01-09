# Vloo MVP App

Vloo is a multi-chain wallet and gifting application built with React Native and Expo. It allows users to manage digital assets, create "Vloos" (digital gift cards/wallets), and transfer funds across various blockchain networks including Bitcoin, Ethereum, Solana, and the MNEE network.

## 🚀 Features

- **Multi-Chain Support**: Manage wallets for Bitcoin, Ethereum, Solana, Polygon, BSC, and more.
- **MNEE Integration**: Specialized support for MNEE token transfers and history.
- **Vloo Gifting**: Create and manage digital gift cards ("Vloos").
- **Transfer & Scheduling**:
  - Direct transfers to single or multiple recipients.
  - **Scheduled Transfers**: Schedule MNEE transfers for a future date/time.
- **Secure Architecture**: Uses deterministic private key generation and secure storage.
- **Modern UI**: Built with a clean, responsive design using custom themes and Lucide icons.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
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
