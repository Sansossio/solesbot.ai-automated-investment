import { CONFIG } from '../config';
import { SolesBotCoins } from '../enum';
import { SolesbotService } from '../solesbot.service';
import { StrategyRunner } from './strategy.runner'

describe('StrategyRunner', () => {
  const service = new SolesbotService();
  const runner = new StrategyRunner(service);

  const getPendingOperations = jest.spyOn(service, 'getPendingOperations');
  const getCoinDetails = jest.spyOn(service, 'getCoinDetails');
  const buy = jest.spyOn(service, 'buy');
  const user = jest.spyOn(service, 'user', 'get');
  const wait = jest.spyOn(runner, 'wait');

  beforeEach(() => {
    wait.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('simple strategy', () => {
    it('should buy coin when profit is greater than minProfit', async () => {
      user.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      });

      expect(buy).toHaveBeenCalledWith(SolesBotCoins.CAKE, 1);
      expect(wait).not.toHaveBeenCalled();
    });

    it('should continue when fails', async () => {
      user.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      buy.mockRejectedValueOnce(new Error('Error buying'));

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      });

      expect(buy).toHaveBeenCalledWith(SolesBotCoins.CAKE, 1);
      expect(wait).not.toHaveBeenCalled();
    });

    it('should not buy coin when profit is less than minProfit', async () => {
      user.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.01
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      });

      expect(buy).toHaveBeenCalledTimes(1);
      expect(wait).toHaveBeenCalledTimes(CONFIG.WAIT_PROFIT.RETRIES + 1);
    });

    it('should not buy coin when balance is less than amount', async () => {
      user.mockReturnValue({
        balance: {
          available: 0,
          balance: 0
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      });

      expect(buy).not.toHaveBeenCalled();
      expect(wait).not.toHaveBeenCalled();
    });

    it('should not buy when coin is pending', async () => {
      user.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        },
      } as any);

      getPendingOperations.mockResolvedValue([
        {
          coin: {
            id: SolesBotCoins.CAKE
          }
        } as any
      ]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 1,
            minProfit: 0.05
          }
        ]
      });

      expect(buy).not.toHaveBeenCalled();
      expect(wait).not.toHaveBeenCalled();
    });
  });

  describe('fill', () => {
    it('should buy coin when fill is true', async () => {
      user.mockReturnValue({
        balance: {
          available: 100,
          balance: 0
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 200,
            minProfit: 0.05,
            fill: true
          }
        ]
      });

      expect(buy).toHaveBeenCalledWith(SolesBotCoins.CAKE, 100);
      expect(wait).not.toHaveBeenCalled();
    });

    it('should not buy coin when amount is less than 1', async () => {
      user.mockReturnValue({
        balance: {
          available: 0,
          balance: 0.02
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
      getCoinDetails.mockResolvedValue({
        profit: 0.1
      });

      await runner.run({
        coins: [
          {
            coin: SolesBotCoins.CAKE,
            amount: 0.01,
            minProfit: 0.05,
            fill: true
          }
        ]
      });

      expect(buy).not.toHaveBeenCalled();
      expect(wait).not.toHaveBeenCalled();
    });
  });

  describe('retries', () => {
    it('should retry until profit is greater than minProfit', async () => {
      user.mockReturnValue({
        balance: {
          available: 1,
          balance: 1
        },
      } as any);

      getPendingOperations.mockResolvedValue([]);
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
      });

      expect(buy).toHaveBeenCalledTimes(1);
      expect(wait).toHaveBeenCalledTimes(2);
    });
  });

  describe('advanced strategies', () => {
    describe('full Polkadot', () => {
      it('should buy Polkadot when profit is greater than minProfit', async () => {
        const userBalance = {
          balance: {
            available: 1700,
            balance: 1700
          },
        } as any;
        user.mockReturnValue(userBalance);

        buy.mockImplementation(async (_coin, amount) => {
          userBalance.balance.available -= amount;
        });

        getPendingOperations
          .mockResolvedValue([]);

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
          });

        for (let i = 0; i < 3; i++) {
          await runner.run({
            coins: [
              {
                coin: SolesBotCoins.Polkadot,
                amount: 500,
                minProfit: 0.81
              }
            ]
          });
        }

        expect(buy).toHaveBeenNthCalledWith(1, SolesBotCoins.Polkadot, 500);
        expect(buy).toHaveBeenNthCalledWith(2, SolesBotCoins.Polkadot, 500);
        expect(buy).toHaveBeenNthCalledWith(3, SolesBotCoins.Polkadot, 500);

        expect(buy).toHaveBeenCalledTimes(3);
        expect(wait).toHaveBeenCalledTimes(2);
      });

      it('should buy Polkadot with fill', async () => {
        const userBalance = {
          balance: {
            available: 1200,
            balance: 1500
          },
        } as any;
        user.mockReturnValue(userBalance);

        buy.mockImplementation(async (_coin, amount) => {
          userBalance.balance.available -= amount;
        });

        getPendingOperations
          .mockResolvedValue([]);

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
          });

        }

        expect(buy).toHaveBeenCalledTimes(3);

        expect(buy).toHaveBeenNthCalledWith(1, SolesBotCoins.Polkadot, 500);
        expect(buy).toHaveBeenNthCalledWith(2, SolesBotCoins.Polkadot, 500);
        expect(buy).toHaveBeenNthCalledWith(3, SolesBotCoins.Polkadot, 200);


        expect(buy).toHaveBeenCalledTimes(3);
        expect(wait).toHaveBeenCalledTimes(2);
      });
    })
  });
});
