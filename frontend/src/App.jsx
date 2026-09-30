import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import TransactionsPage from './pages/TransactionsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <h1 className="text-xl font-semibold tracking-tight">Finance Tracker</h1>
            <NavLink
              to="/transactions"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              Transactions
            </NavLink>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="*" element={<p>Dashboard is coming soon.</p>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
