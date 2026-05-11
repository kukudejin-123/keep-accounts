'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileUp, FileText, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { parseCsv, autoCategorize, type CsvRow, type ColumnMapping } from '@/lib/csv-parser'
import { getAllCategories, addTransaction } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import type { Category, TransactionType } from '@/types'

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'done'

export function CsvImportModal({ open, onClose, onImported }: CsvImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([])
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState({ success: 0, failed: 0, total: 0 })
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setFileName('')
    setHeaders([])
    setParsedRows([])
    setMapping({})
    setSelectedCategory('')
    setImportResult({ success: 0, failed: 0, total: 0 })
    setError('')
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setFileName(file.name)

    try {
      const text = await file.text()
      const result = parseCsv(text)
      setHeaders(result.headers)
      setMapping(result.detectedMapping)
      setParsedRows(result.rows)

      const cats = await getAllCategories()
      setCategories(cats)
      setSelectedCategory('')

      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败')
    }
  }

  const handleMappingConfirm = () => {
    if (!mapping.date && !mapping.amount) {
      setError('请至少选择日期和金额列')
      return
    }
    setError('')
    setStep('preview')
  }

  const handleImport = async () => {
    setImporting(true)
    setError('')
    let success = 0
    let failed = 0

    for (const row of parsedRows) {
      try {
        let categoryId = selectedCategory
        if (!categoryId) {
          categoryId = autoCategorize(row.description) || 'other-expense'
        }
        // For income, default to 'salary' if not categorized
        if (!selectedCategory && row.type === 'income' && !autoCategorize(row.description)) {
          categoryId = 'salary'
        }

        await addTransaction({
          amount: row.amount,
          type: row.type,
          categoryId,
          date: row.date || new Date().toISOString().slice(0, 10),
          description: row.description || '银行流水',
        })
        success++
      } catch {
        failed++
      }
    }

    setImportResult({ success, failed, total: parsedRows.length })
    setStep('done')
    setImporting(false)
  }

  const handleClose = () => {
    if (step === 'done') {
      onImported()
    }
    reset()
    onClose()
  }

  const expenseCount = parsedRows.filter(r => r.type === 'expense').length
  const incomeCount = parsedRows.filter(r => r.type === 'income').length
  const totalAmount = parsedRows.reduce((s, r) => s + r.amount, 0)

  return (
    <Modal open={open} onClose={handleClose} title="导入银行流水">
      {step === 'upload' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">支持支付宝、微信支付、银行导出的 CSV 格式账单。</p>

          <label className="flex flex-col items-center gap-3 glass rounded-2xl p-8 cursor-pointer hover:bg-white/30 transition-all border-2 border-dashed border-white/30">
            <FileUp size={40} className="text-emerald-400" />
            <span className="text-sm font-medium text-gray-600">点击选择 CSV 文件</span>
            <span className="text-xs text-gray-400">或拖拽文件到此处</span>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
          </label>

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/15 text-rose-700 rounded-xl px-4 py-2.5 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-500">支持的 CSV 格式示例：</p>
            <code className="block glass rounded-lg p-2 text-[11px] leading-relaxed">
              交易时间,交易对方,商品说明,收/支,金额<br />
              2024-01-15,麦当劳,麦辣鸡腿堡套餐,支出,35.00<br />
              2024-01-15,公司,工资,收入,12500.00
            </code>
          </div>

          <Button onClick={() => { reset(); onClose() }} variant="ghost" className="w-full">取消</Button>
        </div>
      )}

      {step === 'mapping' && (
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 -mr-1">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
              <Badge>{parsedRows.length} 行</Badge>
            </div>

            <p className="text-sm text-gray-500">请确认以下列映射是否正确，可手动调整：</p>

            <div className="flex flex-col gap-2.5">
              <MappingRow label="日期列" headers={headers} value={mapping.date || ''} onChange={v => setMapping(p => ({ ...p, date: v }))} />
              <MappingRow label="描述列" headers={headers} value={mapping.description || ''} onChange={v => setMapping(p => ({ ...p, description: v }))} />
              <MappingRow label="金额列" headers={headers} value={mapping.amount || ''} onChange={v => setMapping(p => ({ ...p, amount: v }))} />
              <MappingRow label="收支列" headers={headers} value={mapping.type || ''} onChange={v => setMapping(p => ({ ...p, type: v }))} optional />
              <MappingRow label="支出列" headers={headers} value={mapping.expense || ''} onChange={v => setMapping(p => ({ ...p, expense: v }))} optional />
              <MappingRow label="收入列" headers={headers} value={mapping.income || ''} onChange={v => setMapping(p => ({ ...p, income: v }))} optional />
            </div>

            {/* Preview */}
            <div className="glass rounded-xl p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-gray-500 mb-2">数据预览：</p>
              {parsedRows.slice(0, 5).map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-1 border-b border-white/10 last:border-0">
                  <span className="text-gray-400 w-20 truncate">{row.date || '??'}</span>
                  <span className="flex-1 truncate">{row.description}</span>
                  <span className={`font-medium tabular-nums ${row.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {row.type === 'expense' ? '-' : '+'}{formatCurrency(row.amount)}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/15 text-rose-700 rounded-xl px-4 py-2.5 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0 pt-1">
            <Button variant="ghost" onClick={() => setStep('upload')} className="flex items-center gap-1.5">
              <ArrowLeft size={16} /> 返回
            </Button>
            <Button onClick={handleMappingConfirm} className="flex-1 flex items-center justify-center gap-1.5">
              下一步 <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 -mr-1">
            <div className="glass rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{parsedRows.length}</div>
                  <div className="text-xs text-gray-500">总笔数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-500">{expenseCount}</div>
                  <div className="text-xs text-gray-500">支出</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-500">{incomeCount}</div>
                  <div className="text-xs text-gray-500">收入</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600">默认分类</label>
              <p className="text-xs text-gray-400">未自动匹配分类的交易将使用以下默认分类</p>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="glass-input rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">自动识别分类（推荐）</option>
                {categories.filter(c => c.type === 'expense').map(c => (
                  <option key={c.id} value={c.id}>支出 - {c.name}</option>
                ))}
                {categories.filter(c => c.type === 'income').map(c => (
                  <option key={c.id} value={c.id}>收入 - {c.name}</option>
                ))}
              </select>
            </div>

            {/* Full list */}
            <div className="max-h-52 overflow-y-auto glass rounded-xl p-2">
              {parsedRows.map((row, i) => {
                const matchedCat = autoCategorize(row.description)
                const catName = categories.find(c => c.id === (selectedCategory || matchedCat || 'other-expense'))?.name || '其他'
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 text-xs border-b border-white/10 last:border-0">
                    <span className="text-gray-400 w-16 shrink-0">{row.date?.slice(5) || '??-??'}</span>
                    <span className="flex-1 truncate text-gray-700">{row.description || '(无描述)'}</span>
                    <Badge variant={row.type === 'expense' ? 'danger' : 'success'}>{row.type === 'expense' ? '支出' : '收入'}</Badge>
                    <span className="text-gray-400 w-12 text-right truncate">{catName}</span>
                    <span className={`font-medium tabular-nums w-20 text-right ${row.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatCurrency(row.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0 pt-1">
            <Button variant="ghost" onClick={() => setStep('mapping')} className="flex items-center gap-1.5">
              <ArrowLeft size={16} /> 返回
            </Button>
            <Button onClick={handleImport} disabled={importing} className="flex-1 flex items-center justify-center gap-1.5">
              {importing ? (
                <>导入中...</>
              ) : (
                <><Check size={16} /> 确认导入 {parsedRows.length} 笔</>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col gap-4 items-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Check size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">导入完成</h3>
          <div className="glass rounded-2xl p-4 w-full text-center">
            <div className="text-sm text-gray-600">
              成功导入 <span className="font-semibold text-emerald-600">{importResult.success}</span> 笔
              {importResult.failed > 0 && (
                <>，<span className="font-semibold text-rose-600">{importResult.failed}</span> 笔失败</>
              )}
            </div>
          </div>
          <Button onClick={handleClose} className="w-full">完成</Button>
        </div>
      )}
    </Modal>
  )
}

function MappingRow({
  label, headers, value, onChange, optional,
}: {
  label: string
  headers: string[]
  value: string
  onChange: (v: string) => void
  optional?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-14 shrink-0">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`flex-1 glass-input rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/50 ${!value ? 'text-gray-400' : ''}`}
      >
        <option value="">{optional ? '（可跳过）' : '请选择...'}</option>
        {headers.map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
    </div>
  )
}
