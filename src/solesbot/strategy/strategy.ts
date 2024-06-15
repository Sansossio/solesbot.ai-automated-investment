import { SolesBotCoins } from '../enum'

export interface CoinStrategy {
  coin: SolesBotCoins
  amount: number
  fill?: boolean
  minProfit: number
}

export interface SolesbotStrategy {
  coins: CoinStrategy[]
  budget?: number
}
