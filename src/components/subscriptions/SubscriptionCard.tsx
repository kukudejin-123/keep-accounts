'use client'

import { Pencil, Power, PowerOff } from 'lucide-react'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { differenceInDays, parseISO } from 'date-fns'
import type { Subscription, Category } from '@/types'

interface SubscriptionCardProps {
  subscription: Subscription
  category: Category | undefined
  onEdit: () => void
  onToggleActive: () => void
}

export function SubscriptionCard({ subscription, category, onEdit, onToggleActive }: SubscriptionCardProps) {
  const Icon = getIconComponent(category?.icon || 'more-horizontal')
  const daysUntilBilling = differenceInDays(parseISO(subscription.nextBillingDate), new Date())
  const isOverdue = daysUntilBilling < 0

  const cycleLabel = {
    weekly: '每周', monthly: '每月', quarterly: '每季度', yearly: '每年',
  }[subscription.billingCycle]

  const daysBadge = () => {
    if (!subscription.active) return null
    if (isOverdue) return <Badge variant="danger">已逾期 {Math.abs(daysUntilBilling)} 天</Badge>
    if (daysUntilBilling <= 3) return <Badge variant="warning">还剩 {daysUntilBilling} 天</Badge>
    if (daysUntilBilling <= 7) return <Badge variant="warning">还剩 {daysUntilBilling} 天</Badge>
    return <Badge variant="success">还剩 {daysUntilBilling} 天</Badge>
  }

  return (
    <div className={`glass rounded-2xl p-4 transition-all ${!subscription.active ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (category?.color || '#94a3b8') + '20' }}>
            <Icon size={20} style={{ color: category?.color || '#94a3b8' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{subscription.name}</span>
              <span className="text-[11px] text-gray-400">{cycleLabel}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-gray-800">{formatCurrency(subscription.amount)}</span>
              {daysBadge()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleActive} className="p-2 rounded-xl hover:bg-white/30 transition-colors">
            {subscription.active ? <Power size={16} className="text-gray-400" /> : <PowerOff size={16} className="text-gray-400" />}
          </button>
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-white/30 transition-colors">
            <Pencil size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      {subscription.active && (
        <div className="mt-2 text-xs text-gray-400">
          下次扣款: {formatDate(subscription.nextBillingDate)}
        </div>
      )}
    </div>
  )
}
