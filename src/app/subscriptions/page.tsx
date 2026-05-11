'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useCategories } from '@/hooks/useCategories'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm'
import { UpcomingBills } from '@/components/subscriptions/UpcomingBills'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatCurrency } from '@/lib/utils'
import type { Subscription } from '@/types'

export default function SubscriptionsPage() {
  const { activeSubscriptions, inactiveSubscriptions, upcomingBills, loading, add, update } = useSubscriptions()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subscription | undefined>()
  const [showInactive, setShowInactive] = useState(false)

  const monthlyTotal = activeSubscriptions
    .filter(s => s.billingCycle === 'monthly')
    .reduce((s, sub) => s + sub.amount, 0)

  const handleSave = async (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editing && editing.id) {
      await update(editing.id, data)
    } else {
      await add(data)
    }
    setEditing(undefined)
  }

  const handleToggleActive = async (sub: Subscription) => {
    await update(sub.id!, { active: !sub.active })
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">月度订阅总计</span>
          <div className="text-xl font-bold text-gray-800">{formatCurrency(monthlyTotal)}</div>
        </div>
        <button
          onClick={() => { setEditing(undefined); setShowForm(true) }}
          className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95"
        >
          <Plus size={16} />
          添加订阅
        </button>
      </div>

      {/* Upcoming Bills */}
      <UpcomingBills subscriptions={upcomingBills} categories={categories} />

      {/* Active Subscriptions */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500 px-1">活跃订阅 ({activeSubscriptions.length})</h3>
        {activeSubscriptions.length === 0 ? (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400">还没有活跃订阅</p>
          </div>
        ) : (
          activeSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              category={categories.find(c => c.id === sub.categoryId)}
              onEdit={() => { setEditing(sub); setShowForm(true) }}
              onToggleActive={() => handleToggleActive(sub)}
            />
          ))
        )}
      </div>

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-1.5 text-sm text-gray-400 px-1"
          >
            {showInactive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            已暂停 ({inactiveSubscriptions.length})
          </button>
          {showInactive && inactiveSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              category={categories.find(c => c.id === sub.categoryId)}
              onEdit={() => { setEditing(sub); setShowForm(true) }}
              onToggleActive={() => handleToggleActive(sub)}
            />
          ))}
        </div>
      )}

      {/* Form */}
      <SubscriptionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(undefined) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
