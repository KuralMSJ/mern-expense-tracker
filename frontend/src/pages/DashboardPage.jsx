import { useEffect, useState } from 'react'
import RecentTransactions from '../components/RecentTransactions'
import SummaryCards from '../components/SummaryCards'
import { getStatsSummary, getTransactions } from '../api/client'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    summary: null,
    transactions: [],
    summaryLoading: true,
    transactionsLoading: true,
    summaryError: '',
    transactionsError: '',
  })

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      const [summaryResult, transactionsResult] = await Promise.allSettled([
        getStatsSummary(),
        getTransactions({ limit: 5 }),
      ])

      if (!isActive) return

      setDashboard({
        summary: summaryResult.status === 'fulfilled' ? summaryResult.value.data : null,
        transactions:
          transactionsResult.status === 'fulfilled'
            ? transactionsResult.value.data.transactions || []
            : [],
        summaryLoading: false,
        transactionsLoading: false,
        summaryError:
          summaryResult.status === 'rejected'
            ? getErrorMessage(summaryResult.reason, 'Unable to load summary.')
            : '',
        transactionsError:
          transactionsResult.status === 'rejected'
            ? getErrorMessage(transactionsResult.reason, 'Unable to load recent transactions.')
            : '',
      })
    }

    loadDashboard()
    return () => {
      isActive = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Overview
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <SummaryCards
        summary={dashboard.summary}
        loading={dashboard.summaryLoading}
        error={dashboard.summaryError}
      />
      <RecentTransactions
        transactions={dashboard.transactions}
        loading={dashboard.transactionsLoading}
        error={dashboard.transactionsError}
      />
    </section>
  )
}

export default DashboardPage
