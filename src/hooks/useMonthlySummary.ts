'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MonthlySummary } from '@/types'
import { getTransactionsByMonth } from '@/lib/db'
import { getAllCategories } from '@/lib/db'
import { computeMonthlySummary } from '@/lib/utils'

export function useMonthlySummary(year: number, month: number) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [transactions, categories] = await Promise.all([
      getTransactionsByMonth(year, month),
      getAllCategories(),
    ])
    setSummary(computeMonthlySummary(transactions, categories, year, month))
    setLoading(false)
  }, [year, month])

  useEffect(() => { load() }, [load])

  return { summary, loading, reload: load }
}

export function useMultiMonthTrend(year: number, month: number, count = 6) {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const results: MonthlySummary[] = []
    const categories = await getAllCategories()

    for (let i = count - 1; i >= 0; i--) {
      let m = month - i
      let y = year
      while (m < 1) { m += 12; y-- }
      while (m > 12) { m -= 12; y++ }

      const transactions = await getTransactionsByMonth(y, m)
      results.push(computeMonthlySummary(transactions, categories, y, m))
    }

    setSummaries(results)
    setLoading(false)
  }, [year, month, count])

  useEffect(() => { load() }, [load])

  return { summaries, loading, reload: load }
}
