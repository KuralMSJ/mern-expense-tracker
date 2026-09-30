const MAX_MONEY = Math.floor((Number.MAX_SAFE_INTEGER / 10000) * 100) / 100

const roundMoney = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return amount

  const sign = amount < 0 ? -1 : 1
  const [coefficient, exponentText = '0'] = Math.abs(amount).toString().toLowerCase().split('e')
  const [whole, fraction = ''] = coefficient.split('.')
  let cents = BigInt(`${whole}${fraction}`)
  const decimalPlaces = fraction.length - Number(exponentText)
  const shift = 2 - decimalPlaces

  if (shift >= 0) {
    cents *= 10n ** BigInt(shift)
  } else {
    const divisor = 10n ** BigInt(-shift)
    cents = (cents + divisor / 2n) / divisor
  }

  return (Number(cents) * sign) / 100
}

module.exports = { MAX_MONEY, roundMoney }
