import { api } from './client'

export const getAccounts = () =>
  api.get('/treasury/accounts/')

export const createAccount = (body) =>
  api.post('/treasury/accounts/', body)

export const getAccountDetail = (id) =>
  api.get(`/treasury/accounts/${id}/`)

export function getTransactions(accountId, params = {}) {
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      v.forEach((item) => query.append(k, item))
    } else if (v !== null && v !== undefined && v !== '') {
      query.set(k, v)
    }
  }
  const qs = query.toString()
  return api.get(`/treasury/accounts/${accountId}/transactions/${qs ? '?' + qs : ''}`)
}

export const createTransaction = (accountId, body) =>
  api.post(`/treasury/accounts/${accountId}/transactions/`, body)

export const getStatements = (page = 1) =>
  api.get(`/treasury/statements/?page=${page}`)

export const createStatement = (body) =>
  api.post('/treasury/statements/', body)

export const getStatementDetail = (id) =>
  api.get(`/treasury/statements/${id}/`)

export const deleteStatement = (id) =>
  api.delete(`/treasury/statements/${id}/`)

export const treasurerSign = (id) =>
  api.post(`/treasury/statements/${id}/treasurer-sign/`)

export const presidentSign = (id) =>
  api.post(`/treasury/statements/${id}/president-sign/`)
