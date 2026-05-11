'use client'

import { Pencil, Lock } from 'lucide-react'
import { getIconComponent } from './CategoryIconPicker'
import type { Category } from '@/types'

interface CategoryListProps {
  categories: Category[]
  title: string
  onEdit: (cat: Category) => void
}

export function CategoryList({ categories, title, onEdit }: CategoryListProps) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-medium text-gray-500 px-1 mb-1">{title}</h3>
      {categories.map(cat => {
        const Icon = getIconComponent(cat.icon)
        return (
          <div
            key={cat.id}
            className="glass rounded-xl px-4 py-3 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: cat.color + '20' }}
              >
                <Icon size={18} style={{ color: cat.color }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              {cat.isDefault && <Lock size={12} className="text-gray-300" />}
            </div>
            {!cat.isDefault && (
              <button
                onClick={() => onEdit(cat)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
              >
                <Pencil size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
