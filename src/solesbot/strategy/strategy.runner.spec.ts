import { wait } from '../../libs/utils'
import { CONFIG } from '../config'
import { SolesBotCoins } from '../enum'
import { SolesbotService } from '../solesbot.service'
import { StrategyRunner } from './strategy.runner'

jest.mock('../../libs/utils', () => ({
  wait: jest.fn(),
  solesBotNumberFormat: (n: number) => n
}))

describe('StrategyRunner', () => {
  const service = new SolesbotService()
  const runner = new StrategyRunner(service)

  const getPendingOperations = jest.spyOn(service, 'getPendingOperations')
  const getCoinDetails = jest.spyOn(service, 'getCoinDetails')
  const buy = jest.spyOn(service, 'buy')
  const balances = jest.spyOn(service, 'balances', 'get')

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    buy.mockImplementation(async () => {})
  })

  describe('simple strategy', () => {
    it('should buy coin when profit is greater than minProfit', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).toHaveBeenCalledWith(expect.objectContaining({ coin: SolesBotCoins.CAKE, amount: 1 }))
      expect(wait).not.toHaveBeenCalled()
    })

    it('should continue when fails', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      buy.mockRejectedValueOnce(new Error('Error buying'))

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).toHaveBeenCalledWith(expect.objectContaining({ coin: SolesBotCoins.CAKE, amount: 1 }))
      expect(wait).not.toHaveBeenCalled()
    })

    it('should not buy coin when profit is less than minProfit', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.01
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).toHaveBeenCalledTimes(1)
      expect(wait).toHaveBeenCalledTimes(CONFIG.WAIT_PROFIT.RETRIES + 1)
    })

    it('should not buy coin when balance is less than amount', async () => {
      balances.mockReturnValue({
        balance: {
          available: 0,
          balance: 0
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).not.toHaveBeenCalled()
      expect(wait).not.toHaveBeenCalled()
    })

    it('should not buy when coin is pending', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        }
      } as any)

      getPendingOperations.mockResolvedValue([
        {
          coin: {
            id: SolesBotCoins.CAKE
          }
        } as any
      ])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).not.toHaveBeenCalled()
      expect(wait).not.toHaveBeenCalled()
    })

    it('should not buy when there is no coins', async () => {
      getPendingOperations.mockResolvedValue([])

      await runner.run({
        coins: []
      })

      expect(buy).not.toHaveBeenCalled()
      expect(wait).not.toHaveBeenCalled()
    })
  })

  describe('fill', () => {
    it('should buy coin when fill is true', async () => {
      balances.mockReturnValue({
        balance: {
          available: 100,
          balance: 0
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 200,
            minProfit: 0.05,
            fill: true
          }
        ]
      })

      expect(buy).toHaveBeenCalledWith(expect.objectContaining({ coin: SolesBotCoins.CAKE, amount: 100 }))
      expect(wait).not.toHaveBeenCalled()
    })

    it('should not buy coin when amount is less than 1', async () => {
      balances.mockReturnValue({
        balance: {
          available: 0,
          balance: 0.02
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 0.01,
            minProfit: 0.05,
            fill: true
          }
        ]
      })

      expect(buy).not.toHaveBeenCalled()
      expect(wait).not.toHaveBeenCalled()
    })
  })

  describe('retries', () => {
    it('should retry until profit is greater than minProfit', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        }
      } as any)

      getPendingOperations.mockResolvedValue([])
      getCoinDetails
        .mockResolvedValueOnce({
          profit: 0.01
        })
        .mockResolvedValueOnce({
          profit: 0.02
        })
        .mockResolvedValueOnce({
          profit: 0.1
        })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      })

      expect(buy).toHaveBeenCalledTimes(1)
      expect(wait).toHaveBeenCalledTimes(2)
    })
  })

  describe('advanced strategies', () => {
    describe('full Polkadot', () => {
      it('should buy Polkadot when profit is greater than minProfit', async () => {
        const userBalance = {
          balance: {
            available: 1700,
            balance: 1700
          }
        } as any
        balances.mockReturnValue(userBalance)

        buy.mockImplementation(async ({ amount }) => {
          userBalance.balance.available -= +amount
        })

        getPendingOperations
          .mockResolvedValue([])

        getCoinDetails
          .mockResolvedValueOnce({
            profit: 0.1
          })
          .mockResolvedValueOnce({
            profit: 0.9
          })
          .mockResolvedValueOnce({
            profit: 0.1
          })
          .mockResolvedValueOnce({
            profit: 0.9
          })
          .mockResolvedValueOnce({
            profit: 1
          })

        for (let i = 0; i < 3; i++) {
          await runner.run({
            coins: [
              {
                coin: SolesBotCoins.Polkadot,
                amount: 500,
                minProfit: 0.81
              }
            ]
          })
        }

        expect(buy).toHaveBeenNthCalledWith(1, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
        expect(buy).toHaveBeenNthCalledWith(2, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
        expect(buy).toHaveBeenNthCalledWith(3, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))

        expect(buy).toHaveBeenCalledTimes(3)
        expect(wait).toHaveBeenCalledTimes(2)
      })

      it('should buy Polkadot with fill', async () => {
        const userBalance = {
          balance: {
            available: 1200,
            balance: 1500
          }
        } as any
        balances.mockReturnValue(userBalance)

        buy.mockImplementation(async ({ amount }) => {
          userBalance.balance.available -= +amount
        })

        getPendingOperations
          .mockResolvedValue([])

        getCoinDetails
          .mockResolvedValueOnce({
            profit: 0.1
          })
          .mockResolvedValueOnce({
            profit: 0.9
          })
          .mockResolvedValueOnce({
            profit: 0.1
          })
          .mockResolvedValueOnce({
            profit: 0.9
          })
          .mockResolvedValueOnce({
            profit: 1
          })

        for (let i = 0; i < 3; i++) {
          await runner.run({
            coins: [
              {
                coin: SolesBotCoins.Polkadot,
                amount: 500,
                minProfit: 0.81,
                fill: true
              }
            ]
          })
        }

        expect(buy).toHaveBeenCalledTimes(3)

        expect(buy).toHaveBeenNthCalledWith(1, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
        expect(buy).toHaveBeenNthCalledWith(2, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
        expect(buy).toHaveBeenNthCalledWith(3, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 200 }))

        expect(buy).toHaveBeenCalledTimes(3)
        expect(wait).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('strategy with budget', () => {
    it('should buy coins inside budget', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1000,
          balance: 1000
        }
      } as any)

      getPendingOperations.mockResolvedValue([
        {
          coin: {
            id: SolesBotCoins.Chainlink,
            name: 'Chainlink'
          },
          amount: 150
        } as any
      ])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.Chainlink,
            amount: 150,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.CAKE,
            amount: 30,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.Polkadot,
            amount: 500,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.Avalanche,
            amount: 500,
            minProfit: 0.05,
            fill: true
          }
        ],
        budget: 1000
      })

      expect(buy).toHaveBeenNthCalledWith(1, expect.objectContaining({ coin: SolesBotCoins.CAKE, amount: 30 }))
      expect(buy).toHaveBeenNthCalledWith(2, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
      expect(buy).toHaveBeenNthCalledWith(3, expect.objectContaining({ coin: SolesBotCoins.Avalanche, amount: 320 }))
      expect(wait).not.toHaveBeenCalled()
    })

    it('should buy coins inside budget without fill', async () => {
      balances.mockReturnValue({
        balance: {
          available: 1000,
          balance: 1000
        }
      } as any)

      getPendingOperations.mockResolvedValue([
        {
          coin: {
            id: SolesBotCoins.Chainlink,
            name: 'Chainlink'
          },
          amount: 150
        } as any
      ])
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      })

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.Chainlink,
            amount: 150,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.CAKE,
            amount: 30,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.Polkadot,
            amount: 500,
            minProfit: 0.05
          },
          {
            coin: SolesBotCoins.Avalanche,
            amount: 500,
            minProfit: 0.05
          }
        ],
        budget: 1000
      })

      expect(buy).toHaveBeenNthCalledWith(1, expect.objectContaining({ coin: SolesBotCoins.CAKE, amount: 30 }))
      expect(buy).toHaveBeenNthCalledWith(2, expect.objectContaining({ coin: SolesBotCoins.Polkadot, amount: 500 }))
      expect(buy).toHaveBeenCalledTimes(2)
      expect(wait).not.toHaveBeenCalled()
    })

    it('should buy coins keeping budget and prioritizing by order', async () => {
      const pendingFirst: any[] = []
      const pendingSecond = [
        {
          coin: {
            id: SolesBotCoins.CAKE,
            name: 'Cake'
          },
          amount: 0
        },
        {
          coin: {
            id: SolesBotCoins.Chainlink,
            name: 'Chainlink'
          },
          amount: 0
        },
        {
          coin: {
            id: SolesBotCoins.Avalanche,
            name: 'Avalanche'
          },
          amount: 0
        }
      ]
      const pendingThird = [
        ...pendingSecond,
        {
          coin: {
            id: SolesBotCoins.Fantom,
            name: 'Fantom'
          },
          amount: 0
        },
        {
          coin: {
            id: SolesBotCoins.ARBITRUM,
            name: 'Arbitrum'
          },
          amount: 0
        },
        {
          coin: {
            id: SolesBotCoins.Lido,
            name: 'Lido'
          },
          amount: 0
        },
        {
          coin: {
            id: SolesBotCoins.VeChain,
            name: 'Avalanche'
          },
          amount: 0
        }
      ]

      const pending = [
        pendingFirst,
        pendingSecond,
        pendingThird
      ]

      const expectedBuys = [
        [
          [SolesBotCoins.CAKE, 30],
          [SolesBotCoins.Chainlink, 500],
          [SolesBotCoins.Avalanche, 470]
        ],
        [
          [SolesBotCoins.Fantom, 100],
          [SolesBotCoins.ARBITRUM, 300],
          [SolesBotCoins.Lido, 300],
          [SolesBotCoins.VeChain, 300]
        ],
        [
          [SolesBotCoins.Cosmos, 1000]
        ]
      ]

      for (let i = 0; i < 3; i++) {
        balances.mockReturnValue({
          balance: {
            available: 1000,
            balance: 1000
          }
        } as any)

        buy.mockResolvedValue()

        getPendingOperations.mockResolvedValue(pending[i])
        getCoinDetails.mockResolvedValue({
          profit: 0.1
        })

        await runner.run({
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
        })

        expect(wait).not.toHaveBeenCalled()
      }

      const allBuys = expectedBuys.flat()
      for (const [i, [coin, amount]] of allBuys.entries()) {
        expect(buy).toHaveBeenNthCalledWith(i + 1, expect.objectContaining({ coin, amount }))
      }
    })
  })
})
