'use client'

import { motion } from 'framer-motion'
import { TransactionItem } from './TransactionItem'
import { groupByDate, formatDate, formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Receipt } from 'lucide-react'
import type { Transaction, Category } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (t: Transaction) => void
}

export function TransactionList({ transactions, categories, onEdit }: TransactionListProps) {
  const catMap = new Map(categories.map(c => [c.id, c]))

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={48} />}
        title="还没有交易记录"
        description="点击下方按钮添加第一笔记账"
      />
    )
  }

  const groups = groupByDate(transactions)

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, gi) => (
        <motion.div
          key={group.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.03 }}
        >
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-medium text-gray-400">{formatDate(group.date)}</span>
            <div className="flex gap-3 text-xs font-medium">
              {group.dayTotalExpense > 0 && <span className="text-rose-500">-{formatCurrency(group.dayTotalExpense)}</span>}
              {group.dayTotalIncome > 0 && <span className="text-emerald-500">+{formatCurrency(group.dayTotalIncome)}</span>}
            </div>
          </div>
          <div className="glass rounded-2xl p-1.5">
            {group.transactions.map(t => (
              <TransactionItem
                key={t.id}
                transaction={t}
                category={catMap.get(t.categoryId)}
                onClick={() => onEdit(t)}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
