'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Download, Upload, Database, FileUp } from 'lucide-react'
import { db } from '@/lib/db'
import { CsvImportModal } from '@/components/CsvImportModal'

export function DataManager() {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCsvImport, setShowCsvImport] = useState(false)

  const handleExport = async () => {
    try {
      const transactions = await db.transactions.toArray()
      const categories = await db.categories.toArray()
      const subscriptions = await db.subscriptions.toArray()

      const data = { version: 1, exportedAt: new Date().toISOString(), transactions, categories, subscriptions }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `记账本备份_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: '导出成功！' })
    } catch {
      setMessage({ type: 'error', text: '导出失败，请重试' })
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.transactions || !data.categories) {
        setMessage({ type: 'error', text: '无效的备份文件格式' })
        return
      }

      await db.transactions.clear()
      await db.categories.clear()
      await db.subscriptions.clear()

      if (data.categories.length) await db.categories.bulkAdd(data.categories)
      if (data.transactions.length) await db.transactions.bulkAdd(data.transactions)
      if (data.subscriptions?.length) await db.subscriptions.bulkAdd(data.subscriptions)

      setMessage({ type: 'success', text: `已导入 ${data.transactions.length} 笔交易、${data.categories.length} 个分类、${data.subscriptions?.length || 0} 个订阅` })
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setMessage({ type: 'error', text: '导入失败，请检查文件格式' })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-xl hover:bg-white/30 transition-colors">
        <Database size={18} className="text-gray-400" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="数据管理">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">导出数据以备份，或从备份文件恢复数据。</p>

          {message && (
            <div className={`rounded-xl px-4 py-2.5 text-sm ${
              message.type === 'success' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* CSV Import */}
          <Button
            onClick={() => { setOpen(false); setShowCsvImport(true) }}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <FileUp size={16} />
            导入银行流水 CSV
          </Button>

          <div className="border-t border-white/20 my-1" />

          <Button onClick={handleExport} variant="outline" className="w-full flex items-center justify-center gap-2">
            <Download size={16} />
            导出 JSON 备份
          </Button>

          <label className="w-full">
            <div className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all border border-white/40 text-gray-700 hover:bg-white/20 cursor-pointer ${importing ? 'opacity-50' : ''}`}>
              <Upload size={16} />
              {importing ? '导入中...' : '恢复 JSON 备份'}
            </div>
            <input type="file" accept=".json" onChange={handleImport} disabled={importing} className="hidden" />
          </label>

          <p className="text-xs text-gray-400">JSON 备份恢复将替换所有现有数据，请谨慎操作。</p>
        </div>
      </Modal>

      <CsvImportModal
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
        onImported={() => window.location.reload()}
      />
    </>
  )
}
