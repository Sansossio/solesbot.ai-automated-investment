import { wait } from '../../libs/utils'
import { CONFIG } from '../config'
import { SolesbotService } from '../solesbot.service'
import { CoinDetailsResponse } from '../types'
import { CoinStrategy, SolesbotStrategy } from './strategy'

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
    })

    for (const coin of availableStrategies) {
      const coinDetails = await this.service.getCoinDetails(coin.coin)

      if (!this.hasEnoughBalance(coin)) {
        console.log(`Not enough balance to buy ${coin.coin}`)
        continue
      }

      await this.minProfitRetry(coin, coinDetails)

      const amount = Math.min(coin.amount, this.service.balances.balance.available)

      if (amount < 1) {
        console.log(`Not enough balance to buy ${coin.coin}`)
        continue
      }

      try {
        await this.service.buy(coin.coin, amount)
      } catch (e) {
        console.error(`Error buying ${coin.coin}`, e)
      }
    }
  }

  private hasEnoughBalance (coin: CoinStrategy): boolean {
    return this.service.balances.balance.available >= coin.amount || Boolean(coin.fill)
  }

  private async minProfitRetry (coin: CoinStrategy, coinDetails: CoinDetailsResponse): Promise<void> {
    for (let i = 0; i <= CONFIG.WAIT_PROFIT.RETRIES; i++) {
      if (coin.minProfit > coinDetails.profit) {
        await this.wait(CONFIG.WAIT_PROFIT.TIME)

        coinDetails = await this.service.getCoinDetails(coin.coin)

        continue
      }

      break
    }
  }
}
