import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteBudget, getBudgets, getStatsByCategory, saveBudget } from '../api/client'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

const getMonthEnd = (month) => {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10)
}

export function useBudgets(month) {
  const [budgets, setBudgets] = useState([])
  const [unbudgetedSpending, setUnbudgetedSpending] = useState([])
  const [loadState, setLoadState] = useState({
    month,
    loading: true,
    error: '',
    spendingError: '',
  })
  const [saving, setSaving] = useState(false)
  const [mutationError, setMutationError] = useState('')
  const requestIdRef = useRef(0)

  const refreshBudgets = useCallback(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const params = { from: `${month}-01`, to: getMonthEnd(month) }
    return Promise.allSettled([
      getBudgets({ month }),
      getStatsByCategory(params),
    ]).then(([budgetResult, spendingResult]) => {
        if (requestId === requestIdRef.current) {
          if (budgetResult.status === 'rejected') {
            setLoadState({
              month,
              loading: false,
              error: getErrorMessage(budgetResult.reason, 'Unable to load budgets.'),
              spendingError: '',
            })
            return false
          }

          const loadedBudgets = Array.isArray(budgetResult.value.data)
            ? budgetResult.value.data
            : []
          setBudgets(loadedBudgets)

          if (spendingResult.status === 'fulfilled') {
            const budgetedCategories = new Set(loadedBudgets.map((budget) => budget.category))
            const spending = Array.isArray(spendingResult.value.data) ? spendingResult.value.data : []
            setUnbudgetedSpending(
              spending.filter((item) => item.total > 0 && !budgetedCategories.has(item.category))
            )
            setLoadState({ month, loading: false, error: '', spendingError: '' })
          } else {
            setUnbudgetedSpending([])
            setLoadState({
              month,
              loading: false,
              error: '',
              spendingError: getErrorMessage(spendingResult.reason, 'Unable to load unbudgeted spending.'),
            })
          }
        }
        return true
      })
  }, [month])

  const save = useCallback(
    async (payload) => {
      setSaving(true)
      setMutationError('')

      try {
        await saveBudget(payload)
        await refreshBudgets()
        return true
      } catch (err) {
        setMutationError(getErrorMessage(err, 'Unable to save budget.'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [refreshBudgets]
  )

  const remove = useCallback(
    async (id) => {
      setSaving(true)
      setMutationError('')

      try {
        await deleteBudget(id)
        await refreshBudgets()
        return true
      } catch (err) {
        setMutationError(getErrorMessage(err, 'Unable to delete budget.'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [refreshBudgets]
  )

  useEffect(() => {
    refreshBudgets()
  }, [refreshBudgets])

  const loading = loadState.month !== month || loadState.loading
  const error = mutationError || (loadState.month === month ? loadState.error : '')
  const spendingError = loadState.month === month ? loadState.spendingError : ''

  return {
    budgets,
    unbudgetedSpending,
    loading,
    saving,
    error,
    spendingError,
    refreshBudgets,
    save,
    remove,
  }
}
