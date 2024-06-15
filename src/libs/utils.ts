export async function wait (ms: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

export function stringToNumber (value: string): number {
  return parseFloat(value.replace(',', '.'))
}

export function solesBotNumberFormat (value: number): string {
  return value.toFixed(2).replace('.', ',')
}
