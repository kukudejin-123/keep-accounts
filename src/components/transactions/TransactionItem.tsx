'use client'

import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { formatCurrency } from '@/lib/utils'
import type { Transaction, Category } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  category: Category | undefined
  onClick: () => void
}

export function TransactionItem({ transaction, category, onClick }: TransactionItemProps) {
  const Icon = getIconComponent(category?.icon || 'more-horizontal')
  const isExpense = transaction.type === 'expense'

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-1 py-2.5 cursor-pointer hover:bg-white/20 rounded-xl transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (category?.color || '#94a3b8') + '20' }}
      >
        <Icon size={18} style={{ color: category?.color || '#94a3b8' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">{category?.name || '未分类'}</span>
          {transaction.description && (
            <span className="text-xs text-gray-400 truncate">{transaction.description}</span>
          )}
        </div>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}
