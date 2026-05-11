import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, Subscription } from '@/types'
import { defaultCategories } from './default-categories'
import { DB_NAME, DB_VERSION } from './constants'

export class JizhangDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  subscriptions!: EntityTable<Subscription, 'id'>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      transactions: '++id, type, categoryId, date, [type+date]',
      categories: '&id, type, order',
      subscriptions: '++id, active, nextBillingDate',
    })
  }
}

export const db = new JizhangDatabase()

export async function seedDefaultCategories(): Promise<void> {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd(defaultCategories)
  }
}

// --- Transaction CRUD ---

export async function addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> {
  return (await db.transactions.add({
    amount: t.amount,
    type: t.type,
    categoryId: t.categoryId,
    date: t.date,
    description: t.description,
    note: t.note,
    createdAt: Date.now(),
  })) as number
}

export async function updateTransaction(id: number, changes: Partial<Transaction>): Promise<void> {
  await db.transactions.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id)
}

export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  return db.transactions
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray()
}

// --- Category CRUD ---

export async function getCategoriesByType(type: 'expense' | 'income'): Promise<Category[]> {
  return db.categories
    .where('type')
    .equals(type)
    .sortBy('order')
}

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.toArray()
}

export async function addCategory(c: Omit<Category, 'isDefault'>): Promise<void> {
  await db.categories.add({ ...c, isDefault: false })
}

export async function updateCategory(id: string, changes: Partial<Category>): Promise<void> {
  await db.categories.update(id, changes)
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id)
}

// --- Subscription CRUD ---

export async function addSubscription(s: Omit<Subscription, 'id' | 'createdAt'>): Promise<number> {
  return (await db.subscriptions.add({
    name: s.name,
    amount: s.amount,
    categoryId: s.categoryId,
    billingCycle: s.billingCycle,
    nextBillingDate: s.nextBillingDate,
    startDate: s.startDate,
    active: s.active,
    note: s.note,
    createdAt: Date.now(),
  })) as number
}

export async function updateSubscription(id: number, changes: Partial<Subscription>): Promise<void> {
  await db.subscriptions.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteSubscription(id: number): Promise<void> {
  await db.subscriptions.delete(id)
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  return db.subscriptions
    .where('active')
    .equals(1)
    .toArray()
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  return db.subscriptions.toArray()
}
