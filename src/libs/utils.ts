export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function stringToNumber(value: string): number {
  return parseFloat(value.replace(',', '.'));
}
