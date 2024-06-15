import { SolesBotCoins } from '../enum/coins'
import { ManualOperationSituation } from '../enum/manual-operation-situation'

export type BalanceResponse = string

export interface HomeResponse {
  name: string
  photo: string
  email: string
  date: string
  validateemail: boolean
  link: string
  qualificacao: string
  username: string
}

export interface UserBalance {
  balance: {
    balance: number
    available: number
  }
}

export interface Pnl {
  day: number
  week: number
  month: number
}

export interface CoinDetailsResponse {
  buy?: {
    id: number
    icon: string | null
    name: string
    pricebtc: number
    priceeth: number
    price: number
  }
  sell?: {
    id: number
    icon: string | null
    name: string
    pricebtc: number
    priceeth: number
    price: number
  }
  profit: number
  pair?: string
}

export interface ManualOperationsResponse {
  ID: number
  Key: string
  Date: string
  Hour: string
  Exchanges: string
  Prices: string
  Amount: string
  Percent: string
  percentwin: string
  Transaction: string
  Situation: ManualOperationSituation
  Coin: string
  CoinID: SolesBotCoins
  IDSituacao: number
  link: string
}

export interface ManualOperations {
  id: number
  key: string
  date: string
  hour: string
  exchanges: string
  prices: string
  amount: number
  percent: number
  percentWin: number
  transaction: string
  status: ManualOperationSituation
  coin: {
    id: SolesBotCoins
    name: string
  }
  link: string
}

/**
 * {"amount":"5000,00","idbuy":2,"idsell":1,"sug":true,"coin":1}
 */
export interface BuyPayload {
  amount: string
  idbuy: number
  idsell: number
  sug: boolean
  coin: SolesBotCoins
}
