import { SolesBotCoins } from "../../enum";
import { SolesbotStrategy } from "../strategy";

export const Strategies = new Map<number, SolesbotStrategy>([
  [1, {
    coins: [
      {
        coin: SolesBotCoins.Polkadot,
        amount: 500,
        minProfit: 0.81
      }
    ]
  }]
]);
