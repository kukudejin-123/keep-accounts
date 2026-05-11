'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { getTodayISO } from '@/lib/utils'
import { useCategories } from '@/hooks/useCategories'
import type { Transaction, TransactionType } from '@/types'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void
  initial?: Transaction
}

export function TransactionForm({ open, onClose, onSave, initial }: TransactionFormProps) {
  const { expenseCategories, incomeCategories } = useCategories()
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [date, setDate] = useState(initial?.date || getTodayISO())
  const [description, setDescription] = useState(initial?.description || '')

  const categories = type === 'expense' ? expenseCategories : incomeCategories

  useEffect(() => {
    if (open) {
      if (!initial) {
        setType('expense')
        setAmount('')
        setCategoryId('')
        setDate(getTodayISO())
        setDescription('')
      }
    }
  }, [open, initial])

  useEffect(() => {
    if (!initial && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
    if (initial && categories.length > 0 && !categories.find(c => c.id === initial.categoryId)) {
      setCategoryId(categories[0]?.id || '')
    }
  }, [type, categories, initial, categoryId])

  const handleSave = () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) return
    if (!categoryId) return

    onSave({
      amount: num,
      type,
      categoryId,
      date,
      description: description.trim(),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '编辑交易' : '记一笔'}>
      <div className="flex flex-col gap-5">
        {/* Type toggle */}
        <div className="glass rounded-2xl p-1 flex">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-gray-500'
            }`}
          >支出</button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId('') }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-500'
            }`}
          >收入</button>
        </div>

        {/* Amount */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-semibold text-gray-400">¥</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
            className="w-full text-right text-4xl font-bold bg-transparent outline-none pr-1 text-gray-800 placeholder-gray-300"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">分类</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => {
              const Icon = getIconComponent(cat.icon)
              const isSelected = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 ring-2 ring-emerald-400/50'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    <Icon size={16} style={{ color: cat.color }} />
                  </div>
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="备注"
              className="glass-input rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button>
          <Button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0 || !categoryId} className="flex-1">
            {initial ? '保存' : '添加'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
