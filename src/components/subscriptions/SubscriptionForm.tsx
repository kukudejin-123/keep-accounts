'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getIconComponent } from '@/components/categories/CategoryIconPicker'
import { useCategories } from '@/hooks/useCategories'
import { getTodayISO } from '@/lib/utils'
import type { Subscription, BillingCycle } from '@/types'

interface SubscriptionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void
  initial?: Subscription
}

const cycles: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' },
]

export function SubscriptionForm({ open, onClose, onSave, initial }: SubscriptionFormProps) {
  const { expenseCategories } = useCategories()
  const [name, setName] = useState(initial?.name || '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initial?.billingCycle || 'monthly')
  const [nextBillingDate, setNextBillingDate] = useState(initial?.nextBillingDate || getTodayISO())
  const [startDate] = useState(initial?.startDate || getTodayISO())
  const [active, setActive] = useState(initial?.active ?? true)
  const [note, setNote] = useState(initial?.note || '')

  useEffect(() => {
    if (open && !initial && expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id)
    }
  }, [open, initial, expenseCategories, categoryId])

  useEffect(() => {
    if (!open) {
      setName('')
      setAmount('')
      setCategoryId('')
      setBillingCycle('monthly')
      setNextBillingDate(getTodayISO())
      setActive(true)
      setNote('')
    }
  }, [open])

  const handleSave = () => {
    const num = parseFloat(amount)
    if (!name.trim() || !num || num <= 0 || !categoryId) return

    onSave({
      name: name.trim(),
      amount: num,
      categoryId,
      billingCycle,
      nextBillingDate,
      startDate,
      active,
      note: note.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '编辑订阅' : '添加订阅'}>
      <div className="flex flex-col gap-4">
        <Input label="名称" value={name} onChange={e => setName(e.target.value)} placeholder="如: Netflix" />

        <Input
          label="金额"
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">分类</label>
          <div className="grid grid-cols-4 gap-2">
            {expenseCategories.map(cat => {
              const Icon = getIconComponent(cat.icon)
              const isSelected = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    isSelected ? 'bg-emerald-500/15 ring-2 ring-emerald-400/50' : 'hover:bg-white/30'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <Icon size={14} style={{ color: cat.color }} />
                  </div>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">周期</label>
          <div className="flex gap-2">
            {cycles.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setBillingCycle(c.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  billingCycle === c.value ? 'bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-400/50' : 'bg-white/20 text-gray-500 hover:bg-white/30'
                }`}
              >{c.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="下次扣款" type="date" value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)} />
          <Input label="备注" value={note} onChange={e => setNote(e.target.value)} placeholder="可选备注" />
        </div>

        <label className="flex items-center gap-2.5 glass rounded-xl px-4 py-3 cursor-pointer">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          <span className="text-sm text-gray-700">启用订阅</span>
        </label>

        <div className="flex gap-2 mt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !amount || !categoryId} className="flex-1">保存</Button>
        </div>
      </div>
    </Modal>
  )
}
