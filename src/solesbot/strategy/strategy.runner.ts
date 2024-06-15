import { wait } from '../../libs/utils'
import { CONFIG } from '../config'
import { SolesbotService } from '../solesbot.service'
import { CoinDetailsResponse, ManualOperations } from '../types'
import { CoinStrategy, SolesbotStrategy } from './strategy'

export class StrategyRunner {
  constructor (
    private readonly service: SolesbotService
  ) {}

  async run (strategy: SolesbotStrategy): Promise<void> {
    const pendingOperations = await this.service.getPendingOperations()

    const availableStrategies = strategy.coins.filter(coin => {
      return !pendingOperations.some(operation => operation.coin.id === coin.coin)
    })

    if (availableStrategies.length === 0) {
      console.warn('No strategies to run')
      return
    }

    for (const coin of availableStrategies) {
      const coinDetails = await this.service.getCoinDetails(coin.coin)

      const budget = this.calculateBudget(strategy, pendingOperations)

      if (budget <= 0) {
        console.log('Budget is zero')
        break
      }

      if (!this.hasEnoughBalance(budget, coin)) {
        console.log(`Not enough balance to buy ${coin.coin}`)
        continue
      }

      await this.minProfitRetry(coin, coinDetails)

      const amount = Math.min(coin.amount, budget)

      try {
        await this.service.buy(coin.coin, amount)

        if (strategy.budget !== undefined) {
          strategy.budget -= amount
        }
      } catch (e) {
        console.error(`Error buying ${coin.coin}`, e)
      }
    }
  }

  private calculateBudget (strategy: SolesbotStrategy, pendingOperations: ManualOperations[]): number {
    const budget = strategy.budget ?? this.service.balances.balance.available

    const spent = pendingOperations
      .filter(operation => strategy.coins.some(coin => coin.coin === operation.coin.id))
      .reduce((acc, operation) => {
        return acc + operation.amount
      }, 0)

    return budget - spent
  }

  private hasEnoughBalance (budget: number, coin: CoinStrategy): boolean {
    return budget >= coin.amount || Boolean(coin.fill)
  }

  private async minProfitRetry (coin: CoinStrategy, coinDetails: CoinDetailsResponse): Promise<void> {
    for (let i = 0; i <= CONFIG.WAIT_PROFIT.RETRIES; i++) {
      if (coin.minProfit > coinDetails.profit) {
        await wait(CONFIG.WAIT_PROFIT.TIME)

        coinDetails = await this.service.getCoinDetails(coin.coin)

        continue
      }

      break
    }
  }
}
