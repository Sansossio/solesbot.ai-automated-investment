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

export type InitialDataResponse = {
  home: HomeResponse;
  balance: {
    balance: number;
    available: number;
  }
  pnl: {
    day: number;
    week: number;
    month: number;
  }
};

export type CoinDetailsResponse = {
  buy: {
    id: number;
    icon: string | null;
    name: string;
    pricebtc: number;
    priceeth: number;
    price: number;
  };
  sell: {
    id: number;
    icon: string | null;
    name: string;
    pricebtc: number;
    priceeth: number;
    price: number;
  };
  profit: number;
  pair: string;
};
