export const fromMinorAmount = (amount: number) => {
  return formatToTwoDecimals(amount / 100);
};

export function formatToTwoDecimals(number: number): number {
  return Math.round(number * 100) / 100;
}
