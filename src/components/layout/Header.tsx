'use client'

import { useMonth } from './MonthContext'
import { MonthSelector } from './MonthSelector'
import { DataManager } from '@/components/DataManager'

export function Header() {
  const { year, month, setMonth } = useMonth()

  return (
    <header className="sticky top-0 z-40 pt-4 pb-3 bg-white/60 backdrop-blur-xl -mx-4 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          记账本
        </h1>
        <div className="flex items-center gap-1">
          <MonthSelector year={year} month={month} onChange={setMonth} />
          <DataManager />
        </div>
      </div>
    </header>
  )
}
