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

export function getCoinByName(name: string): SolesBotCoins {
  const keys = Object.keys(SolesBotCoins);
  const key = keys.find((key) => name.match(new RegExp(key, 'i')));

  return SolesBotCoins[key as keyof typeof SolesBotCoins] || SolesBotCoins.UNKNOWN;
}
