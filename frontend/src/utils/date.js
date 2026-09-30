const pad2 = (value) => String(value).padStart(2, '0')

export const getLocalDateString = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const getLocalMonthString = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`

export const formatDateOnly = (value) => {
  const dateString = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : typeof value === 'string'
      ? value.slice(0, 10)
      : ''

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return ''

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  if (date.toISOString().slice(0, 10) !== dateString) return ''

  return date.toLocaleDateString('en-IN', { timeZone: 'UTC' })
}
