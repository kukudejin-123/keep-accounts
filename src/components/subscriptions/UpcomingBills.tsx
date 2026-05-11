'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { Bell } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Subscription, Category } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface UpcomingBillsProps {
  subscriptions: Subscription[]
  categories: Category[]
}

export function UpcomingBills({ subscriptions, categories }: UpcomingBillsProps) {
  const catMap = new Map(categories.map(c => [c.id, c]))

  if (subscriptions.length === 0) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">即将扣款</h3>
        <EmptyState icon={<Bell size={36} />} title="本月没有待付账单" />
      </div>
    )
  }

  const totalUpcoming = subscriptions.reduce((s, sub) => s + sub.amount, 0)

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">即将扣款</h3>
        <span className="text-xs font-medium text-gray-500">共 {formatCurrency(totalUpcoming)}</span>
      </div>
      <div className="flex flex-col gap-2">
        {subscriptions.map(sub => {
          const cat = catMap.get(sub.categoryId)
          const Icon = getIconComponent(cat?.icon || 'more-horizontal')
          const daysUntil = differenceInDays(parseISO(sub.nextBillingDate), new Date())
          return (
            <div key={sub.id} className="flex items-center gap-3 py-2 border-b border-white/20 last:border-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}>
                <Icon size={13} style={{ color: cat?.color || '#94a3b8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-700 truncate block">{sub.name}</span>
              </div>
              <span className="text-xs text-gray-400 tabular-nums">
                {daysUntil <= 0 ? '已到期' : `${daysUntil}天后`}
              </span>
              <span className="text-sm font-semibold text-gray-800 tabular-nums">{formatCurrency(sub.amount)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
