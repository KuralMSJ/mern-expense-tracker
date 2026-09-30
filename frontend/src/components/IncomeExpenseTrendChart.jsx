import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getStatsTrend } from '../api/client'
import { formatCompactRupees, formatRupees } from '../utils/currency'

const formatAxisDate = (value, groupBy) => {
  const date = new Date(`${value}${groupBy === 'month' ? '-01' : ''}T12:00:00.000Z`)
  return date.toLocaleDateString('en-IN',
    groupBy === 'month'
      ? { month: 'short', year: '2-digit', timeZone: 'UTC' }
      : { month: 'short', day: 'numeric', timeZone: 'UTC' }
  )
}

function IncomeExpenseTrendChart() {
  const [groupBy, setGroupBy] = useState('month')
  const [trend, setTrend] = useState([])
  const [request, setRequest] = useState({ groupBy: 'month', loading: true, error: '' })

  useEffect(() => {
    let isActive = true

    getStatsTrend({ groupBy })
      .then((response) => {
        if (isActive) {
          setTrend(Array.isArray(response.data) ? response.data : [])
          setRequest({ groupBy, loading: false, error: '' })
        }
      })
      .catch((err) => {
        if (isActive) {
          setRequest({
            groupBy,
            loading: false,
            error: err?.response?.data?.message || err?.message || 'Unable to load income and expense trend.',
          })
        }
      })

    return () => {
      isActive = false
    }
  }, [groupBy])

  const loading = request.groupBy !== groupBy || request.loading
  const error = request.groupBy === groupBy ? request.error : ''

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">Income vs expenses</h3>
        <div className="inline-flex rounded-md border border-slate-300 p-0.5" role="group" aria-label="Trend grouping">
          {[
            { value: 'month', label: 'Month' },
            { value: 'day', label: 'Day' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={groupBy === value}
              onClick={() => setGroupBy(value)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                groupBy === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading trend...</p>
      ) : error ? (
        <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>
      ) : trend.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No income or expense activity yet
        </p>
      ) : (
        <div className="mt-4 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatAxisDate(value, groupBy)}
                minTickGap={24}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCompactRupees}
                width={64}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(value) => formatAxisDate(value, groupBy)}
                formatter={(value, name) => [formatRupees(value), name]}
                contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1' }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default IncomeExpenseTrendChart
