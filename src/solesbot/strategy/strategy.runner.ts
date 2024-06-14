import { wait } from "../../libs/utils";
import { CONFIG } from "../config";
import { SolesbotService } from "../solesbot.service";
import { SolesbotStrategy } from "./strategy";

export class StrategyRunner {
  constructor (
    private readonly service: SolesbotService
  ) {}

  async wait (ms: number): Promise<void> {
    await wait(ms)
  }

  async run (strategy: SolesbotStrategy): Promise<void> {
    const pendingOperations = await this.service.getPendingOperations()

    const availableStrategies = strategy.coins.filter(coin => {
      return !pendingOperations.some(operation => operation.coin.id === coin.coin)
    });

    for (const coin of availableStrategies) {
      let coinDetails = await this.service.getCoinDetails(coin.coin)

      if (this.service.user.balance.available < coin.amount && !coin.fill) {
        console.log(`Not enough balance to buy ${coin.coin}`)
        continue
      }

      for (let i = 0; i <= CONFIG.WAIT_PROFIT.RETRIES; i++) {
        if (coin.minProfit > coinDetails.profit) {
          await this.wait(CONFIG.WAIT_PROFIT.TIME)

          coinDetails = await this.service.getCoinDetails(coin.coin)

          continue
        }

        break
      }

      await this.service.buy(coin.coin, coin.amount)
    }
  }
}
