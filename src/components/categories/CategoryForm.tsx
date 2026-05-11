'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CategoryIconPicker } from './CategoryIconPicker'
import { CATEGORY_COLORS } from '@/lib/constants'
import type { Category, TransactionType } from '@/types'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Category, 'isDefault'>) => void
  initial?: Category
}

export function CategoryForm({ open, onClose, onSave, initial }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense')
  const [icon, setIcon] = useState(initial?.icon || 'more-horizontal')
  const [color, setColor] = useState(initial?.color || CATEGORY_COLORS[0])

  const reset = () => {
    setName('')
    setType('expense')
    setIcon('more-horizontal')
    setColor(CATEGORY_COLORS[0])
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ id: initial?.id || name.toLowerCase().replace(/\s+/g, '-'), name: name.trim(), type, icon, color, order: initial?.order || 99 })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '编辑分类' : '添加分类'}>
      <div className="flex flex-col gap-4">
        <Input label="名称" value={name} onChange={e => setName(e.target.value)} placeholder="分类名称" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">类型</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                type === 'expense' ? 'bg-rose-500/20 text-rose-600 ring-2 ring-rose-400/50' : 'bg-white/20 text-gray-500 hover:bg-white/30'
              }`}
            >支出</button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                type === 'income' ? 'bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-400/50' : 'bg-white/20 text-gray-500 hover:bg-white/30'
              }`}
            >收入</button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">图标</label>
          <CategoryIconPicker selected={icon} onSelect={setIcon} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">颜色</label>
          <div className="flex gap-2">
            {CATEGORY_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">保存</Button>
        </div>
      </div>
    </Modal>
  )
}
