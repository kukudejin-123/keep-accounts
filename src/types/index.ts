export type TransactionType = 'expense' | 'income'
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  isDefault: boolean
  order: number
}

export interface Transaction {
  id?: number
  amount: number
  type: TransactionType
  categoryId: string
  date: string
  description: string
  note?: string
  createdAt: number
  updatedAt?: number
}

export interface Subscription {
  id?: number
  name: string
  amount: number
  categoryId: string
  billingCycle: BillingCycle
  nextBillingDate: string
  startDate: string
  active: boolean
  note?: string
  createdAt: number
  updatedAt?: number
}

export interface CategorySummary {
  categoryId: string
  name: string
  icon: string
  color: string
  amount: number
  percentage: number
}

export interface MonthlySummary {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
  expenseByCategory: CategorySummary[]
  incomeByCategory: CategorySummary[]
}

export interface TransactionGroup {
  date: string
  transactions: Transaction[]
  dayTotalExpense: number
  dayTotalIncome: number
}
