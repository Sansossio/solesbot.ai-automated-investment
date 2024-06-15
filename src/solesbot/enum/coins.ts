export enum SolesBotCoins {
  CAKE = 1,
  ARBITRUM = 2,
  VeChain = 5,
  Lido = 6,
  Cosmos = 8,
  Filecoin = 9,
  Fantom = 10,
  Polkadot = 11,
  Avalanche = 12,
  Chainlink = 13,
  UNKNOWN = -1,
}

interface SolesBotConfig {
  duration: number
  maxAmount: number
  roi: number
  netProfit: number
}

export function getCoinByName (name: string): SolesBotCoins {
  const keys = Object.keys(SolesBotCoins)
  const key = keys.find((key) => name.match(new RegExp(key, 'i')))

  // eslint-disable-next-line
  return SolesBotCoins[key as keyof typeof SolesBotCoins] || SolesBotCoins.UNKNOWN
}

export const CoinsConfig: Map<SolesBotCoins, SolesBotConfig> = new Map([
  [SolesBotCoins.CAKE, { duration: 200, maxAmount: 300, roi: 1.88, netProfit: 1.13 }],
  [SolesBotCoins.ARBITRUM, { duration: 200, maxAmount: 300, roi: 0.86, netProfit: 0.52 }],
  [SolesBotCoins.VeChain, { duration: 200, maxAmount: 300, roi: 0.60, netProfit: 0.36 }],
  [SolesBotCoins.Lido, { duration: 200, maxAmount: 300, roi: 0.65, netProfit: 0.39 }],
  [SolesBotCoins.Cosmos, { duration: 200, maxAmount: 1000, roi: 0.81, netProfit: 0.49 }],
  [SolesBotCoins.Filecoin, { duration: 200, maxAmount: 1000, roi: 0.55, netProfit: 0.33 }],
  [SolesBotCoins.Fantom, { duration: 200, maxAmount: 100, roi: 1.68, netProfit: 1.01 }],
  [SolesBotCoins.Polkadot, { duration: 60, maxAmount: 500, roi: 0.91, netProfit: 0.55 }],
  [SolesBotCoins.Avalanche, { duration: 200, maxAmount: 500, roi: 0.81, netProfit: 0.49 }],
  [SolesBotCoins.Chainlink, { duration: 200, maxAmount: 500, roi: 0.86, netProfit: 0.52 }]
])
