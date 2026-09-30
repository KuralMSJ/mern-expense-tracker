import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
        <Routes>
          <Route
            path="*"
            element={(
              <div className="mx-auto max-w-6xl">
                <h1 className="text-xl font-semibold tracking-tight">Finance Tracker</h1>
              </div>
            )}
          />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
