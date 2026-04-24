export function formatPrice(amountCents: number, currency: string = "USD", locale?: string): string {
  const amount = amountCents / 100
  const fmt = new Intl.NumberFormat(locale ?? undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return fmt.format(amount)
}
