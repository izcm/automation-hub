export const PLATE_NUMBER_PATTERN = /^[A-Z]{2} ?\d{5}$/;

export function normalizePlateNumber(input: string): string {
  return input.slice(0, 2).toUpperCase() + input.slice(2);
}
