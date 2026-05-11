'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transaction } from '@/types'
import { addTransaction, updateTransaction, deleteTransaction, getTransactionsByMonth, getRecentTransactions } from '@/lib/db'

export function useTransactions(year: number, month: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getTransactionsByMonth(year, month)
    setTransactions(data)
    setLoading(false)
  }, [year, month])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    await addTransaction(t)
    await load()
  }, [load])

  const update = useCallback(async (id: number, changes: Partial<Transaction>) => {
    await updateTransaction(id, changes)
    await load()
  }, [load])

  const remove = useCallback(async (id: number) => {
    await deleteTransaction(id)
    await load()
  }, [load])

  return { transactions, loading, add, update, remove, reload: load }
}

export function useRecentTransactions(limit = 5) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getRecentTransactions(limit)
    setTransactions(data)
    setLoading(false)
  }, [limit])

  useEffect(() => { load() }, [load])

  return { transactions, loading }
}
