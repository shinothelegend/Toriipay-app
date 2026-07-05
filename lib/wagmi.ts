import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import type { Chain } from "viem";

// Verified against docs.hashkeychain.net/docs/Build-on-HashKey-Chain/network-info
export const hashkeyTestnet: Chain = {
  id: 133,
  name: "HashKey Chain Testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.hsk.xyz"] },
  },
  blockExplorers: {
    default: { name: "HashKey Testnet Explorer", url: "https://testnet-explorer.hsk.xyz" },
  },
  testnet: true,
};

export const hashkeyMainnet: Chain = {
  id: 177,
  name: "HashKey Chain",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.hsk.xyz"] },
  },
  blockExplorers: {
    default: { name: "HashKey Blockscout", url: "https://hashkey.blockscout.com" },
  },
};

export const wagmiConfig = createConfig({
  chains: [hashkeyTestnet, hashkeyMainnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    }),
  ],
  transports: {
    [hashkeyTestnet.id]: http("https://testnet.hsk.xyz"),
    [hashkeyMainnet.id]: http("https://mainnet.hsk.xyz"),
  },
});
