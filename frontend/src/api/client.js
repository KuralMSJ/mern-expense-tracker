import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

export const getTransactions = (params = {}) => api.get('/transactions', { params })
export const createTransaction = (payload) => api.post('/transactions', payload)
export const updateTransaction = (id, payload) => api.put(`/transactions/${id}`, payload)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)
export const exportTransactions = () => api.get('/transactions/export', { responseType: 'blob' })
export const getStatsSummary = (params = {}) => api.get('/stats/summary', { params })
export const getStatsByCategory = (params = {}) => api.get('/stats/by-category', { params })
export const getStatsTrend = (params = {}) => api.get('/stats/trend', { params })
export const getBudgets = (params = {}) => api.get('/budgets', { params })
export const saveBudget = (payload) => api.put('/budgets', payload)
export const deleteBudget = (id) => api.delete(`/budgets/${id}`)

export default api
