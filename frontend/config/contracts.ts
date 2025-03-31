export const CONTRACT_ADDRESSES = {
  BETTING_CONTRACT: process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS as `0x${string}`,
  TOKEN_CONTRACT: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
};

export const BETTING_CONTRACT_ABI = [
  {
    inputs: [],
    name: "getCurrentMarket",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "aiPrediction", type: "uint256" },
      { name: "totalOverBets", type: "uint256" },
      { name: "totalUnderBets", type: "uint256" },
      { name: "settled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "isOver", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getUserBets",
    outputs: [
      { name: "overBet", type: "uint256" },
      { name: "underBet", type: "uint256" },
      { name: "hasClaimed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMarketsCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "aiPrediction", type: "uint256" },
      { name: "actualPrice", type: "uint256" },
      { name: "totalOverBets", type: "uint256" },
      { name: "totalUnderBets", type: "uint256" },
      { name: "settled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getClaimTransaction",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "aiAgent",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

export const TOKEN_CONTRACT_ABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "buyTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimFaucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]; 