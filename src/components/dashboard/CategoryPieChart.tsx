'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { PieChart as PieChartIcon } from 'lucide-react'
import type { CategorySummary } from '@/types'

interface CategoryPieChartProps {
  data: CategorySummary[]
  title: string
  emptyText: string
}

export function CategoryPieChart({ data, title, emptyText }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <EmptyState icon={<PieChartIcon size={36} />} title={emptyText} />
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={56}
                paddingAngle={3}
                dataKey="amount"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {data.slice(0, 5).map(item => {
            const Icon = getIconComponent(item.icon)
            return (
              <div key={item.categoryId} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '20' }}>
                  <Icon size={11} style={{ color: item.color }} />
                </div>
                <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                <span className="text-xs text-gray-400 tabular-nums">{item.percentage}%</span>
                <span className="text-xs font-medium text-gray-700 tabular-nums">{formatCurrency(item.amount)}</span>
              </div>
            )
          })}
          {data.length > 5 && (
            <span className="text-[11px] text-gray-400 mt-1">等 {data.length} 个分类</span>
          )}
        </div>
      </div>
    </div>
  )
}
