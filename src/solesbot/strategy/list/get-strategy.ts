import { SolesBotCoins } from '../../enum'
import { SolesbotStrategy } from '../strategy'

export const Strategies = new Map<number, SolesbotStrategy>([
  [1, {
    coins: [
      {
        coin: SolesBotCoins.Polkadot,
        amount: 500,
        minProfit: 0.86
      }
    ]
  }],
  [2, {
    coins: [
      {
        coin: SolesBotCoins.CAKE,
        amount: 30,
        minProfit: 1.52
      },
      {
        coin: SolesBotCoins.Chainlink,
        amount: 500,
        minProfit: 0.86
      },
      {
        coin: SolesBotCoins.Avalanche,
        amount: 500,
        minProfit: 0.75,
        fill: true
      },
      {
        coin: SolesBotCoins.Fantom,
        amount: 100,
        minProfit: 1.60
      },
      {
        coin: SolesBotCoins.ARBITRUM,
        amount: 300,
        minProfit: 0.81
      },
      {
        coin: SolesBotCoins.Lido,
        amount: 300,
        minProfit: 0.60
      },
      {
        coin: SolesBotCoins.VeChain,
        amount: 300,
        minProfit: 0.55,
        fill: true
      },
      {
        coin: SolesBotCoins.Cosmos,
        amount: 1000,
        minProfit: 0.74,
        fill: true
      }
    ],
    budget: 1000
  }
  ]
])
