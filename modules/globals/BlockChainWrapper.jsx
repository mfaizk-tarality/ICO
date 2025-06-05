"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  cookieStorage,
  cookieToInitialState,
  createStorage,
  WagmiProvider,
} from "wagmi";

export const appConfigurations = [
  {
    rpc: "https://bsc-testnet-rpc.publicnode.com",
    explorerName: "BNB",
    explorerUrl: "https://testnet.bscscan.com/",
    chainId: 97,
    chainName: "BNB Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Binance Coin",
      symbol: "BNB",
    },
    multicall3Address: "0x72f6B0d7C6592a228c7C7D2ba39f3b45Be31D1a4",
  },
];

export const appConfigurationsMainNet = [
  {
    rpc: "https://bsc-dataseed1.bnbchain.org",
    explorerName: "BNB",
    explorerUrl: "https://bscscan.com",
    chainId: 56,
    chainName: "BNB",
    nativeCurrency: {
      decimals: 18,
      name: "Binance Coin",
      symbol: "BNB",
    },
    multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
  },
];

export const ChainConfig = appConfigurations.map((config) => ({
  // export const ChainConfig = appConfigurationsMainNet.map((config) => ({
  id: config.chainId,
  name: config.chainName,
  network: config.chainName,
  iconUrl: config.iconUrl ? config.iconUrl : undefined,
  nativeCurrency: config.nativeCurrency,
  rpcUrls: {
    public: { http: [config.rpc] },
    default: { http: [config.rpc] },
  },
  blockExplorers: {
    etherscan: {
      name: config.explorerName,
      url: config.explorerUrl,
    },
    default: {
      name: config.explorerName,
      url: config.explorerUrl,
    },
  },
  contracts: {
    multicall3: {
      address: config.multicall3Address,
      blockCreated: config.blockCreated,
    },
  },
}));

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "38f6cbdcf2b580899317454c1ff8a4d4";
export const networks = [...ChainConfig];
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

const metadata = {
  name: "next-reown-appkit",
  description: "next-reown-appkit",
  // url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: "dark",

  features: {
    analytics: true,
    email: false,
    socials: [],
    swaps: false,
    pay: false,
    send: false,
    walletFeaturesOrder: ["receive" | "onramp" | "swaps" | "send"],
  },
  themeVariables: {
    "--w3m-accent": "#000000",
  },
});

const BlockChainWrapper = ({ children, cookies }) => {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      {children}
    </WagmiProvider>
  );
};

export default BlockChainWrapper;
