'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Receipt } from 'lucide-react'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'
import type { Transaction, Category } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories: Category[]
}

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  const catMap = new Map(categories.map(c => [c.id, c]))

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">最近交易</h3>
        </div>
        <EmptyState
          icon={<Receipt size={36} />}
          title="开始记账吧！"
          description="点击下方 + 号添加第一笔交易"
        />
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">最近交易</h3>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex flex-col">
        {transactions.slice(0, 5).map((t, i) => {
          const cat = catMap.get(t.categoryId)
          const Icon = getIconComponent(cat?.icon || 'more-horizontal')
          const isExpense = t.type === 'expense'
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2.5 border-b border-white/20 last:border-0"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}
              >
                <Icon size={15} style={{ color: cat?.color || '#94a3b8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate">{t.description || cat?.name || '未分类'}</div>
                <div className="text-[11px] text-gray-400">{t.date.slice(5)}</div>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isExpense ? '- ' : '+ '}{formatCurrency(t.amount)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
