export interface SolesbotOperatorEvent {
  email: string
  password: string
  cookies?: {
    [key: string]: string | number
  }
  strategies: number[]
};
