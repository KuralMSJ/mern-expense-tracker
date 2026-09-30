import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../api/client'

const normalizeTransactions = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.transactions)) return payload.transactions
  return []
}

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

const upsertTransaction = (transactions, transaction) => {
  const updated = transactions.filter((item) => item._id !== transaction._id)
  updated.push(transaction)
  return updated.sort((left, right) => {
    const dateDifference = new Date(right.date) - new Date(left.date)
    return dateDifference || new Date(right.createdAt) - new Date(left.createdAt)
  })
}

export function useTransactions({
  search = '',
  type = '',
  category = '',
  from = '',
  to = '',
  page = 1,
  limit = 10,
} = {}) {
  const queryKey = JSON.stringify({ search, type, category, from, to, page, limit })
  const invalidDateRange = Boolean(from && to && from > to)
  const [queryState, setQueryState] = useState(() => ({
    key: queryKey,
    transactions: [],
    pagination: { page, limit, totalItems: 0, totalPages: 1 },
    loading: true,
    error: '',
  }))
  const [saving, setSaving] = useState(false)
  const [mutationError, setMutationError] = useState({ key: queryKey, message: '' })
  const requestIdRef = useRef(0)

  const refreshTransactions = useCallback(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (invalidDateRange) return Promise.resolve(false)

    return getTransactions({ search, type, category, from, to, page, limit })
      .then((response) => {
        if (requestId === requestIdRef.current) {
          const loadedTransactions = normalizeTransactions(response.data)
          setQueryState({
            key: queryKey,
            transactions: loadedTransactions,
            pagination: response.data?.pagination || {
              page,
              limit,
              totalItems: loadedTransactions.length,
              totalPages: 1,
            },
            loading: false,
            error: '',
          })
        }
        return true
      })
      .catch((requestError) => {
        if (requestId === requestIdRef.current) {
          setQueryState({
            key: queryKey,
            transactions: [],
            pagination: { page, limit, totalItems: 0, totalPages: 1 },
            loading: false,
            error: getErrorMessage(requestError, 'Failed to load transactions.'),
          })
        }
        return false
      })
  }, [search, type, category, from, to, page, limit, queryKey, invalidDateRange])

  const saveTransaction = useCallback(
    async (payload, id) => {
      setSaving(true)
      setMutationError({ key: queryKey, message: '' })

      try {
        let response
        if (id) {
          response = await updateTransaction(id, payload)
        } else {
          response = await createTransaction(payload)
        }

        const refreshed = await refreshTransactions()
        if (!refreshed && response.data && !search && !type && !category && !from && !to && page === 1) {
          setQueryState((current) => {
            const currentTransactions = current.key === queryKey ? current.transactions : []
            return {
              key: queryKey,
              transactions: upsertTransaction(currentTransactions, response.data).slice(0, limit),
              pagination: current.key === queryKey
                ? current.pagination
                : { page, limit, totalItems: 1, totalPages: 1 },
              loading: false,
              error: current.key === queryKey ? current.error : '',
            }
          })
        }
        return true
      } catch (err) {
        setMutationError({ key: queryKey, message: getErrorMessage(err, 'Unable to save transaction.') })
        return false
      } finally {
        setSaving(false)
      }
    },
    [refreshTransactions, search, type, category, from, to, page, limit, queryKey]
  )

  const removeTransaction = useCallback(
    async (id) => {
      setSaving(true)
      setMutationError({ key: queryKey, message: '' })

      try {
        await deleteTransaction(id)
        const refreshed = await refreshTransactions()
        if (!refreshed) {
          setQueryState((current) => current.key === queryKey
            ? { ...current, transactions: current.transactions.filter((transaction) => transaction._id !== id) }
            : current)
        }
        return true
      } catch (err) {
        setMutationError({ key: queryKey, message: getErrorMessage(err, 'Unable to delete transaction.') })
        return false
      } finally {
        setSaving(false)
      }
    },
    [refreshTransactions, queryKey]
  )

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  const transactions = invalidDateRange || queryState.key !== queryKey
    ? []
    : queryState.transactions
  const pagination = queryState.key === queryKey
    ? queryState.pagination
    : { page, limit, totalItems: 0, totalPages: 1 }
  const loading = !invalidDateRange && (queryState.key !== queryKey || queryState.loading)
  const error = invalidDateRange
    ? 'From date must be on or before To date.'
    : mutationError.key === queryKey && mutationError.message
      ? mutationError.message
      : queryState.key === queryKey
        ? queryState.error
        : ''

  return {
    transactions,
    pagination,
    loading,
    saving,
    error,
    refreshTransactions,
    saveTransaction,
    removeTransaction,
  }
}
