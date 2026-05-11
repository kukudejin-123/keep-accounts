'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useMonth } from '@/components/layout/MonthContext'
import { useMonthlySummary, useMultiMonthTrend } from '@/hooks/useMonthlySummary'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { MonthlyOverview } from '@/components/dashboard/MonthlyOverview'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useTransactions } from '@/hooks/useTransactions'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { year, month } = useMonth()
  const { summary, loading: summaryLoading } = useMonthlySummary(year, month)
  const { summaries, loading: trendLoading } = useMultiMonthTrend(year, month, 6)
  const { transactions: recentTxs, loading: recentLoading } = useRecentTransactions(5)
  const { categories } = useCategories()
  const { add } = useTransactions(year, month)
  const [showForm, setShowForm] = useState(false)

  const loading = summaryLoading || trendLoading || recentLoading

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl p-4">
              <div className="skeleton h-3 w-12 rounded mb-3" />
              <div className="skeleton h-6 w-20 rounded" />
            </div>
          ))}
        </div>
        <LoadingSkeleton count={3} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      {summary && (
        <MonthlyOverview
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          netBalance={summary.netBalance}
          transactionCount={summary.transactionCount}
        />
      )}

      {summary && (
        <>
          <CategoryPieChart
            data={summary.expenseByCategory}
            title="支出分类"
            emptyText="本月暂无支出"
          />
          <CategoryPieChart
            data={summary.incomeByCategory}
            title="收入分类"
            emptyText="本月暂无收入"
          />
        </>
      )}

      <MonthlyTrendChart summaries={summaries} />
      <RecentTransactions transactions={recentTxs} categories={categories} />

      <div className="fixed bottom-24 right-6 z-30">
        <button
          onClick={() => setShowForm(true)}
          className="w-14 h-14 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-emerald-500/40 transition-all active:scale-90 flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (data) => {
          await add(data)
          setShowForm(false)
        }}
      />
    </motion.div>
  )
}
