import { AxiosInstance } from 'axios'

const FIXED_COOKIE = ['Secure', 'HttpOnly', 'Partitioned', 'SameSite=None']

interface RegisterCookieManager {
  initialCookies?: Cookies
  onCookiesUpdated?: (cookies: Cookies) => void
}

export type Cookies = Map<string, string | number>

export class CookieManager {
  private readonly cookies: Cookies = new Map()

  constructor (private readonly options: RegisterCookieManager = {}) {
    this.cookies = options.initialCookies ?? new Map()
  }

  private parseCookies (str: string): object {
    const rx = /([^;=\s]*)=([^;]*)/g
    const obj: any = {}
    for (let m; (m = rx.exec(str)) != null;) {
      obj[m[1]] = decodeURIComponent(m[2])
    }
    return obj
  }

  async setCookie (cookies: string[]): Promise<void> {
    const cookiesParsed: any = cookies.map((cookie) => this.parseCookies(cookie)).flat().reduce((acc, cookie) => ({ ...acc, ...cookie }), {})

    for (const cookieKey in cookiesParsed) {
      this.cookies.set(cookieKey, cookiesParsed[cookieKey] as string)
    }

    await this.options.onCookiesUpdated?.(this.cookies)
  }

  toString (): string {
    const response = [...this.cookies.keys()]
      .reduce<string[]>((acc, key) => {
      const value = this.cookies.get(key) as string
      acc.push(`${key}=${value}`)
      return acc
    }, [])
      .concat(FIXED_COOKIE)
      .join('; ')

    return `${response};`
  }

  static fromAxios (axios: AxiosInstance, options?: RegisterCookieManager): void {
    const self = new CookieManager(options)

    axios.interceptors.request.use((config) => {
      const { headers } = config
      const cookie = self.toString()
      const referer = headers.referer

      if (cookie !== '') {
        headers.cookie = cookie
      }

      headers.referer = referer

      return config
    })

    axios.interceptors.response.use(async (config) => {
      const { headers } = config
      const cookies = headers['set-cookie']
      if (cookies == null) {
        return config
      }

      await self.setCookie(cookies)

      return config
    })
  }
}
