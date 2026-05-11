'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrendingUp } from 'lucide-react'
import type { MonthlySummary } from '@/types'

interface MonthlyTrendChartProps {
  summaries: MonthlySummary[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ¥{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MonthlyTrendChart({ summaries }: MonthlyTrendChartProps) {
  const data = summaries.map(s => ({
    name: `${s.month}月`,
    income: s.totalIncome,
    expense: s.totalExpense,
  }))

  const hasData = data.some(d => d.income > 0 || d.expense > 0)

  if (!hasData) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">月度趋势</h3>
        <EmptyState icon={<TrendingUp size={36} />} title="暂无趋势数据" />
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">月度趋势</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={24} />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
