import axios from 'axios'
import qs from 'qs'
import { CookieManager } from "../services/cookie.manager";
import { CONFIG } from '../config';
import { BalanceResponse, CoinDetailsResponse, HomeResponse, InitialDataResponse, ManualOperations, ManualOperationsResponse } from './types/solesbot.response';
import { SolesBotCoins, getCoinByName } from './enum/coins';
import { ManualOperationSituation } from './enum/manual-operation-situation';

export class SolesbotService {
  private readonly cookieManager = new CookieManager()

  private readonly transport = axios.create({
    baseURL: CONFIG.SOLESBOT.URL,
  })

  constructor () {
    this.interceptors()
  }

  private async awaitMs (ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  private interceptors (): void {
    this.transport.interceptors.request.use((config) => {
      const { headers } = config
      const cookie = this.cookieManager.toString()
      const referer = headers.referer || CONFIG.SOLESBOT.URL

      if (cookie) {
        headers.cookie = cookie
      }

      headers.referer = referer

      return config
    })

    this.transport.interceptors.response.use((config) => {
      const { headers } = config
      const cookies = headers['set-cookie']
      if (!cookies) {
        return config
      }

      this.cookieManager.setCookie(cookies)

      return config
    })
  }

  async start (): Promise<void> {
    const { data } = await this.transport.get('/')

    if (data.match(/Waiting Room/)) {
      console.warn('Waiting Room detected, waiting for 25 seconds to try again')

      await this.awaitMs(CONFIG.SOLESBOT.WAIT_ROOM_TIMEOUT)

      return this.start()
    }

    console.log('Initialized')
  }

  async login (email: string, password: string): Promise<void> {
    const data = qs.stringify({
      'returnUrl': '',
      'client_id': '',
      'Email': email,
      'Password': password,
    });

    const { data: response } = await this.transport.post<string>('/login', data, {
      method: 'POST',
      maxBodyLength: Infinity,
      data,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 303,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.match(/\/dashboard/)) {
      throw new Error('Login failed')
    }

    console.log('Logged in')
  }

  async getPnl (): Promise<{ day: number; week: number; month: number }> {
    const [day, week, month] = await Promise.all([
      this.transport.get<BalanceResponse>('/wallet/getpnl', { params: { days: '1' } }),
      this.transport.get<BalanceResponse>('/wallet/getpnl', { params: { days: '7' } }),
      this.transport.get<BalanceResponse>('/wallet/getpnl', { params: { days: '30' } }),
    ])

    return {
      day: +day.data,
      week: +week.data,
      month: +month.data,
    }
  }

  async getData (): Promise<InitialDataResponse> {
    const [dataHome, balance, available, pnl] = await Promise.all([
      this.transport.get<HomeResponse>('/home/dataHome'),
      this.transport.get<BalanceResponse>('/wallet/getbalanceusd'),
      this.transport.get<BalanceResponse>('/wallet/getavaibalebalanceusd'),
      this.getPnl(),
    ])

    return {
      home: dataHome.data,
      balance: {
        balance: +balance.data,
        available: +available.data,
      },
      pnl,
    }
  }

  async getCoinDetails(coin: SolesBotCoins): Promise<CoinDetailsResponse> {
    const { data } = await this.transport.get('/robot/suggestionManual',{
      params: {
        coin: coin
      }
    })

    return data
  }

  async getCoins(coins: SolesBotCoins[]): Promise<CoinDetailsResponse[]> {
    return Promise.all(coins.map((coin) => this.getCoinDetails(coin)))
  }

  async getManualOperations(): Promise<ManualOperations[]> {
    const { data: { result } } = await this.transport.post<{ result: ManualOperationsResponse[] }>('/robot/getManualOperation?p=0&period=7')

    return result.map((operation): ManualOperations => ({
      id: operation.ID,
      key: operation.Key,
      date: operation.Date,
      hour: operation.Hour,
      coin: {
        id: getCoinByName(operation.Coin),
        name: operation.Coin,
      },
      exchanges: operation.Exchanges,
      prices: operation.Prices,
      amount: +operation.Amount,
      percent: +operation.Percent,
      percentWin: +operation.percentwin,
      transaction: operation.Transaction,
      status: operation.Situation,
      link: operation.link,
    }))
  }

  async getPendingOperations(): Promise<ManualOperations[]> {
    const operations = await this.getManualOperations()

    return operations.filter((operation) => operation.status === ManualOperationSituation.Pending)
  }
}
