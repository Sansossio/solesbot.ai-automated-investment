import { SolesBotCoins } from "../enum"

export type CoinStrategy = {
  coin: SolesBotCoins;
  amount: number;
  fill?: boolean;
  minProfit: number;
}

export type SolesbotStrategy = {
  coins: CoinStrategy[];
  budget?: number;
}
