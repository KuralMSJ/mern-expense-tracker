import { useState } from 'react'
import FilterBar from '../components/FilterBar'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { useTransactions } from '../hooks/useTransactions'

function TransactionsPage() {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    datePreset: 'all',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  })
  const {
    transactions,
    pagination,
    loading,
    saving,
    error,
    saveTransaction,
    removeTransaction,
  } = useTransactions(filters)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const handleFilterChange = (changes) => {
    setFilters((current) => ({ ...current, ...changes, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((current) => ({ ...current, page }))
  }

  const handleSubmit = async (payload) => {
    const success = await saveTransaction(payload, editingTransaction?._id)

    if (success) {
      setEditingTransaction(null)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this transaction?')
    if (!confirmed) return

    const success = await removeTransaction(id)

    if (success && editingTransaction?._id === id) {
      setEditingTransaction(null)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Records
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Transactions</h2>
      </div>

      <TransactionForm
        key={editingTransaction?._id || 'new-transaction'}
        initialValues={editingTransaction}
        onSubmit={handleSubmit}
        onCancel={() => setEditingTransaction(null)}
        loading={saving}
        serverError={error}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">Transactions</h3>
          {!editingTransaction && (
            <button
              type="button"
              onClick={() => setEditingTransaction(null)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Add new
            </button>
          )}
        </div>

        <FilterBar filters={filters} onChange={handleFilterChange} />

        <TransactionList
          transactions={transactions}
          onEdit={(transaction) => setEditingTransaction(transaction)}
          onDelete={handleDelete}
          loading={loading}
          error={error}
          emptyMessage={
            filters.search || filters.type || filters.category || filters.from || filters.to
              ? 'No transactions match these filters'
              : 'No transactions yet'
          }
        />

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600" aria-live="polite">
            {loading
              ? 'Loading results...'
              : `Showing ${pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalItems)} of ${pagination.totalItems} · Page ${pagination.page} of ${pagination.totalPages}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={loading || pagination.page >= pagination.totalPages}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TransactionsPage
