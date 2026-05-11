'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatYearMonth, isCurrentMonth } from '@/lib/utils'

interface MonthSelectorProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  const next = () => {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  const goToday = () => {
    const now = new Date()
    onChange(now.getFullYear(), now.getMonth() + 1)
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={prev} className="p-1.5 rounded-xl hover:bg-white/30 transition-colors">
        <ChevronLeft size={20} className="text-gray-500" />
      </button>
      <button onClick={goToday} className="flex items-center gap-1.5 px-3 py-1 rounded-xl hover:bg-white/30 transition-colors">
        <span className="text-base font-semibold text-gray-800 min-w-[90px] text-center">
          {formatYearMonth(year, month)}
        </span>
        {isCurrentMonth(year, month) && (
          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">今</span>
        )}
      </button>
      <button onClick={next} className="p-1.5 rounded-xl hover:bg-white/30 transition-colors">
        <ChevronRight size={20} className="text-gray-500" />
      </button>
    </div>
  )
}
