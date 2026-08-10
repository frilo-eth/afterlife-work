interface PriceDisplayProps {
  amount: number
  showCents?: boolean
  className?: string
}

export function PriceDisplay({ amount, showCents = false, className = '' }: PriceDisplayProps) {
  const formatted = showCents
    ? (amount / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    : Math.floor(amount / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })

  return <span className={className}>{formatted}</span>
}
