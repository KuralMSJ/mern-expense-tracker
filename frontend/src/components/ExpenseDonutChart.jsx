import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getStatsByCategory } from '../api/client'
import { formatRupees } from '../utils/currency'

const COLORS = ['#0f766e', '#e11d48', '#ca8a04', '#2563eb', '#c026d3', '#65a30d', '#0891b2', '#475569']

const groupSmallCategories = (categories) => {
  const total = categories.reduce((sum, item) => sum + item.total, 0)
  if (categories.length < 3 || total <= 0) return categories

  const smallCategories = categories.filter((item) => item.total / total < 0.04)
  const visibleCategories = categories.filter((item) => item.total / total >= 0.04)
  if (!smallCategories.length || !visibleCategories.length) return categories

  const otherTotal = smallCategories.reduce((sum, item) => sum + item.total, 0)
  const visibleOther = visibleCategories.find((item) => item.category === 'Other')
  const grouped = visibleCategories.filter((item) => item.category !== 'Other')
  grouped.push({ category: 'Other', total: otherTotal + (visibleOther?.total || 0) })
  return grouped.sort((left, right) => right.total - left.total)
}

function ExpenseDonutChart() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    getStatsByCategory()
      .then((response) => {
        if (isActive) setCategories(Array.isArray(response.data) ? response.data : [])
      })
      .catch((err) => {
        if (isActive) {
          setError(err?.response?.data?.message || err?.message || 'Unable to load expense categories.')
        }
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const chartData = groupSmallCategories(categories)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">Expenses by category</h3>
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading category totals...</p>
      ) : error ? (
        <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>
      ) : chartData.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No expense data yet
        </p>
      ) : (
        <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((item, index) => (
                    <Cell key={`${item.category}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupees(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2">
            {chartData.map((item, index) => (
              <li key={`${item.category}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate">{item.category}</span>
                </span>
                <span className="shrink-0 font-medium text-slate-800">{formatRupees(item.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ExpenseDonutChart
