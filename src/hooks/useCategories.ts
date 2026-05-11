'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Category } from '@/types'
import { getAllCategories, getCategoriesByType, addCategory, updateCategory, deleteCategory, seedDefaultCategories } from '@/lib/db'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    await seedDefaultCategories()
    const all = await getAllCategories()
    setCategories(all)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const getByType = useCallback(async (type: 'expense' | 'income') => {
    return getCategoriesByType(type)
  }, [])

  const add = useCallback(async (cat: Omit<Category, 'isDefault'>) => {
    await addCategory(cat)
    await load()
  }, [load])

  const update = useCallback(async (id: string, changes: Partial<Category>) => {
    await updateCategory(id, changes)
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await deleteCategory(id)
    await load()
  }, [load])

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  return { categories, expenseCategories, incomeCategories, loading, add, update, remove, reload: load, getByType }
}
