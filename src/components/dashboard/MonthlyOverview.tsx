'use client'

import { motion } from 'framer-motion'
import { Wallet, TrendingDown, TrendingUp, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MonthlyOverviewProps {
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}

const cards = [
  { key: 'income', label: '收入', icon: TrendingUp, color: 'emerald', bg: 'rgba(16,185,129,0.15)' },
  { key: 'expense', label: '支出', icon: TrendingDown, color: 'rose', bg: 'rgba(244,63,94,0.15)' },
  { key: 'balance', label: '结余', icon: Wallet, color: 'blue', bg: 'rgba(59,130,246,0.15)' },
  { key: 'count', label: '笔数', icon: Receipt, color: 'violet', bg: 'rgba(139,92,246,0.15)' },
]

export function MonthlyOverview({ totalIncome, totalExpense, netBalance, transactionCount }: MonthlyOverviewProps) {
  const values: Record<string, { value: string; color: string }> = {
    income: { value: formatCurrency(totalIncome), color: 'text-emerald-500' },
    expense: { value: formatCurrency(totalExpense), color: 'text-rose-500' },
    balance: {
      value: formatCurrency(Math.abs(netBalance)),
      color: netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500',
    },
    count: { value: String(transactionCount), color: 'text-gray-800' },
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        const val = values[card.key]
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <Icon size={16} className={`text-${card.color}-500`} />
              </div>
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
            </div>
            <span className={`text-xl font-bold tabular-nums ${val.color}`}>
              {card.key === 'balance' && netBalance < 0 ? '-' : ''}{val.value}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
