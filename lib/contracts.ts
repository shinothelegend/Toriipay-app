// Keep this file's addresses in lockstep with contracts/deployments/<network>.json
// -- copy the output of `npm run deploy:testnet` (or :mainnet) straight in.

export const HASHKEY_TESTNET_CHAIN_ID = 133;
export const HASHKEY_MAINNET_CHAIN_ID = 177;

export const CONTRACTS = {
  [HASHKEY_TESTNET_CHAIN_ID]: {
    merchantRegistry: (process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_TESTNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    gateway: (process.env.NEXT_PUBLIC_GATEWAY_TESTNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    collector: (process.env.NEXT_PUBLIC_COLLECTOR_TESTNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    usdc: (process.env.NEXT_PUBLIC_USDC_TESTNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
  [HASHKEY_MAINNET_CHAIN_ID]: {
    merchantRegistry: (process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_MAINNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    gateway: (process.env.NEXT_PUBLIC_GATEWAY_MAINNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    collector: (process.env.NEXT_PUBLIC_COLLECTOR_MAINNET ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    // Official HashKey Chain Mainnet USDC (Bridged USDC), per
    // docs.hashkeychain.net/docs/Build-on-HashKey-Chain/Token-Contracts
    usdc: "0x054ed45810DbBAb8B27668922D110669c9D88D0a" as `0x${string}`,
  },
} as const;

export const gatewayAbi = [
  {
    type: "function",
    name: "createInvoice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "crossChain", type: "bool" },
    ],
    outputs: [{ name: "invoiceId", type: "bytes32" }],
  },
  {
    type: "function",
    name: "payInvoiceDirect",
    stateMutability: "nonpayable",
    inputs: [
      { name: "invoiceId", type: "bytes32" },
      { name: "hspPaymentId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getInvoice",
    stateMutability: "view",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "merchant", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint64" },
          { name: "status", type: "uint8" },
          { name: "hspPaymentId", type: "bytes32" },
          { name: "payer", type: "address" },
          { name: "crossChain", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "InvoiceCreated",
    inputs: [
      { name: "invoiceId", type: "bytes32", indexed: true },
      { name: "merchant", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "InvoiceSettled",
    inputs: [
      { name: "invoiceId", type: "bytes32", indexed: true },
      { name: "merchant", type: "address", indexed: true },
    ],
  },
] as const;

export const registryAbi = [
  {
    type: "function",
    name: "merchants",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "registered", type: "bool" },
      { name: "compliant", type: "bool" },
      { name: "trustScore", type: "uint32" },
      { name: "settledCount", type: "uint64" },
      { name: "disputedCount", type: "uint64" },
      { name: "payoutAddress", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const INVOICE_STATUS = [
  "None",
  "Open",
  "AwaitingHSPConfirmation",
  "Settled",
  "Disputed",
  "Cancelled",
] as const;
