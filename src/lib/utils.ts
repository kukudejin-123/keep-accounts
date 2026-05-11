import type { Transaction, TransactionGroup, CategorySummary, MonthlySummary, Category } from '@/types'

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateString: string): string {
  const [, month, day] = dateString.split('-')
  return `${parseInt(month)}月${parseInt(day)}日`
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}年${month}月`
}

export function getMonthBounds(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() + 1 === month
}

export function groupByDate(transactions: Transaction[]): TransactionGroup[] {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
  const groups: Record<string, Transaction[]> = {}

  for (const t of sorted) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }

  return Object.entries(groups).map(([date, txs]) => ({
    date,
    transactions: txs,
    dayTotalExpense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    dayTotalIncome: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
  }))
}

export function getTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function computeMonthlySummary(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): MonthlySummary {
  const catMap = new Map(categories.map(c => [c.id, c]))

  const income = transactions.filter(t => t.type === 'income')
  const expense = transactions.filter(t => t.type === 'expense')

  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0)

  const aggregateByCategory = (txs: Transaction[]): CategorySummary[] => {
    const groups = new Map<string, number>()
    for (const t of txs) {
      groups.set(t.categoryId, (groups.get(t.categoryId) || 0) + t.amount)
    }
    const total = Array.from(groups.values()).reduce((s, v) => s + v, 0)
    return Array.from(groups.entries())
      .map(([id, amount]) => {
        const cat = catMap.get(id)
        return {
          categoryId: id,
          name: cat?.name || '未分类',
          icon: cat?.icon || 'help-circle',
          color: cat?.color || '#94a3b8',
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    expenseByCategory: aggregateByCategory(expense),
    incomeByCategory: aggregateByCategory(income),
  }
}
