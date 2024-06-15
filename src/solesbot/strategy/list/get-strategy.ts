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
        minProfit: 0.05
      },
      {
        coin: SolesBotCoins.Chainlink,
        amount: 500,
        minProfit: 0.05
      },
      {
        coin: SolesBotCoins.Avalanche,
        amount: 500,
        minProfit: 0.05,
        fill: true
      },
      {
        coin: SolesBotCoins.Fantom,
        amount: 100,
        minProfit: 0.05
      },
      {
        coin: SolesBotCoins.ARBITRUM,
        amount: 300,
        minProfit: 0.05
      },
      {
        coin: SolesBotCoins.Lido,
        amount: 300,
        minProfit: 0.05
      },
      {
        coin: SolesBotCoins.VeChain,
        amount: 300,
        minProfit: 0.05,
        fill: true
      },
      {
        coin: SolesBotCoins.Cosmos,
        amount: 1000,
        minProfit: 0.05,
        fill: true
      }
    ],
    budget: 1000
  }
  ]
])
