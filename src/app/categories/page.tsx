'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryList } from '@/components/categories/CategoryList'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import type { Category } from '@/types'

export default function CategoriesPage() {
  const { expenseCategories, incomeCategories, loading, add, update } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()

  const handleSave = async (data: Omit<Category, 'isDefault'>) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await add(data)
    }
    setEditing(undefined)
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setShowForm(true)
  }

  if (loading) return <LoadingSkeleton count={4} />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">分类管理</h2>
        <button
          onClick={() => { setEditing(undefined); setShowForm(true) }}
          className="flex items-center gap-1.5 glass rounded-xl px-3.5 py-2 text-sm font-medium text-emerald-600 hover:bg-white/30 transition-all"
        >
          <Plus size={16} />
          添加分类
        </button>
      </div>

      <CategoryList categories={expenseCategories} title="支出分类" onEdit={handleEdit} />
      <CategoryList categories={incomeCategories} title="收入分类" onEdit={handleEdit} />

      <CategoryForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(undefined) }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
