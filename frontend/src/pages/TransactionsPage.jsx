import { useState } from 'react'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { useTransactions } from '../hooks/useTransactions'

function TransactionsPage() {
  const { transactions, loading, saving, error, saveTransaction, removeTransaction } = useTransactions()
  const [editingTransaction, setEditingTransaction] = useState(null)

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

        <TransactionList
          transactions={transactions}
          onEdit={(transaction) => setEditingTransaction(transaction)}
          onDelete={handleDelete}
          loading={loading}
          error={error}
        />
      </div>
    </section>
  )
}

export default TransactionsPage
