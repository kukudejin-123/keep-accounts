'use client'

import { Search, X } from 'lucide-react'
import type { TransactionType } from '@/types'

interface TransactionFiltersProps {
  typeFilter: TransactionType | 'all'
  onTypeChange: (type: TransactionType | 'all') => void
  search: string
  onSearchChange: (search: string) => void
}

export function TransactionFilters({ typeFilter, onTypeChange, search, onSearchChange }: TransactionFiltersProps) {
  const hasFilters = typeFilter !== 'all' || search

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              typeFilter === type
                ? type === 'expense'
                  ? 'bg-rose-500/20 text-rose-600'
                  : type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : 'bg-white/30 text-gray-700'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            {type === 'all' ? '全部' : type === 'expense' ? '支出' : '收入'}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => { onTypeChange('all'); onSearchChange('') }}
            className="px-2 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/20 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="搜索描述..."
          className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-400/50"
        />
      </div>
    </div>
  )
}
