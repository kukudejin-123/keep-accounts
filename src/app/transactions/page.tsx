'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useMonth } from '@/components/layout/MonthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatCurrency } from '@/lib/utils'
import type { Transaction, TransactionType } from '@/types'

export default function TransactionsPage() {
  const { year, month } = useMonth()
  const { transactions, loading, add, update, remove } = useTransactions(year, month)
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSave = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editing && editing.id) {
      await update(editing.id, data)
    } else {
      await add(data)
    }
    setEditing(undefined)
  }

  const handleEdit = (t: Transaction) => {
    setEditing(t)
    setShowForm(true)
  }

  const monthExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  if (loading) return <LoadingSkeleton count={5} />

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-500">支出 <span className="font-semibold text-rose-500">{formatCurrency(monthExpense)}</span></span>
          <span className="text-gray-500">收入 <span className="font-semibold text-emerald-500">{formatCurrency(monthIncome)}</span></span>
        </div>
        <button
          onClick={() => { setEditing(undefined); setShowForm(true) }}
          className="flex items-center gap-1 bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus size={16} />
          记账
        </button>
      </div>

      {/* Filters */}
      <TransactionFilters
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={filtered}
        categories={categories}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(undefined) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
