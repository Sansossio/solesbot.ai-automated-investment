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
});