const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatRupees = (value) => currencyFormatter.format(toFiniteNumber(value))
export const formatCompactRupees = (value) => compactCurrencyFormatter.format(toFiniteNumber(value))
