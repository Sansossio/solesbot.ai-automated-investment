export function stringToNumber(value: string): number {
  return parseFloat(value.replace(',', '.'));
}