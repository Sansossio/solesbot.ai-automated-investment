import { SolesBotCoins } from "../enum/coins";
import { ManualOperationSituation } from "../enum/manual-operation-situation";

export type BalanceResponse = string;

export type HomeResponse = {
  name: string;
  photo: string;
  email: string;
  date: string;
  validateemail: boolean;
  link: string;
  qualificacao: string;
  username: string;
};

export type UserBalance = {
  balance: {
    balance: number;
    available: number;
  }
};

export type Pnl = {
  day: number;
  week: number;
  month: number;
};

export type CoinDetailsResponse = {
  buy?: {
    id: number;
    icon: string | null;
    name: string;
    pricebtc: number;
    priceeth: number;
    price: number;
  };
  sell?: {
    id: number;
    icon: string | null;
    name: string;
    pricebtc: number;
    priceeth: number;
    price: number;
  };
  profit: number;
  pair?: string;
};

export type ManualOperationsResponse = {
  ID: number;
  Key: string;
  Date: string;
  Hour: string;
  Exchanges: string;
  Prices: string;
  Amount: string;
  Percent: string;
  percentwin: string;
  Transaction: string;
  Situation: ManualOperationSituation;
  Coin: string;
  CoinID: SolesBotCoins;
  IDSituacao: number;
  link: string;
};

export type ManualOperations = {
  id: number;
  key: string;
  date: string;
  hour: string;
  exchanges: string;
  prices: string;
  amount: number;
  percent: number;
  percentWin: number;
  transaction: string;
  status: ManualOperationSituation;
  coin: {
    id: SolesBotCoins;
    name: string;
  }
  link: string;
}