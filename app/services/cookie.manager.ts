import fs from 'fs';

const FIXED_COOKIE = ['Secure', 'HttpOnly', 'Partitioned', 'SameSite=None']

export class CookieManager {
  private cookiesPath: string;
  private cookies: Map<string, string | number> = new Map();

  constructor(cookiesPath: string = 'cookies.json') {
    this.cookiesPath = cookiesPath;
    this.loadCookies(); // Load cookies on initialization
  }

  private parseCookies(str: string) {
    const rx = /([^;=\s]*)=([^;]*)/g;
    const obj: any = {};
    // eslint-disable-next-line
    for (let m; m = rx.exec(str);) { obj[m[1]] = decodeURIComponent(m[2]); }
    return obj;
  }

  setCookie(cookies: string[]) {
    const cookiesParsed = cookies.map((cookie) => this.parseCookies(cookie)).flat().reduce((acc, cookie) => ({ ...acc, ...cookie }), {});
    for (const cookieKey in cookiesParsed) {
      this.cookies.set(cookieKey, cookiesParsed[cookieKey]);
    }
    this.saveCookies(); // Save cookies after setting
  }

  toString() {
    const response = [...this.cookies.keys()]
      .reduce<string[]>((acc, key) => {
        const value = this.cookies.get(key);
        acc.push(`${key}=${value}`);
        return acc;
      }, [])
      .concat(FIXED_COOKIE)
      .join('; ');

    return `${response};`;
  }

  private loadCookies() {
    if (!fs.existsSync(this.cookiesPath)) {
      return;
    }

    try {
      const data = fs.readFileSync(this.cookiesPath, 'utf8');
      const saved = JSON.parse(data);
      for (const [key, value] of saved) {
        this.cookies.set(key, value);
      }
    } catch (err) {
      console.error('Error loading cookies:', err);
    }
  }

  private saveCookies() {
    try {
      const data = JSON.stringify(Array.from(this.cookies.entries())); // Convert Map to array and stringify
      fs.writeFileSync(this.cookiesPath, data, 'utf8');
    } catch (err) {
      console.error('Error saving cookies:', err);
    }
  }
}
