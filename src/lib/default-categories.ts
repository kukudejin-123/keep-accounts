import type { Category } from '@/types'

export const defaultExpenseCategories: Category[] = [
  { id: 'food',       name: '餐饮',     type: 'expense', icon: 'utensils-crossed', color: '#10b981', isDefault: true, order: 1 },
  { id: 'transport',  name: '交通',     type: 'expense', icon: 'car',              color: '#3b82f6', isDefault: true, order: 2 },
  { id: 'shopping',   name: '购物',     type: 'expense', icon: 'shopping-bag',     color: '#f59e0b', isDefault: true, order: 3 },
  { id: 'entertain',  name: '娱乐',     type: 'expense', icon: 'gamepad-2',        color: '#8b5cf6', isDefault: true, order: 4 },
  { id: 'housing',    name: '居住',     type: 'expense', icon: 'home',             color: '#06b6d4', isDefault: true, order: 5 },
  { id: 'utility',    name: '水电',     type: 'expense', icon: 'zap',              color: '#f97316', isDefault: true, order: 6 },
  { id: 'medical',    name: '医疗',     type: 'expense', icon: 'heart',            color: '#ef4444', isDefault: true, order: 7 },
  { id: 'education',  name: '教育',     type: 'expense', icon: 'book-open',        color: '#6366f1', isDefault: true, order: 8 },
  { id: 'comm',       name: '通讯',     type: 'expense', icon: 'smartphone',       color: '#14b8a6', isDefault: true, order: 9 },
  { id: 'clothing',   name: '衣着',     type: 'expense', icon: 'shirt',            color: '#ec4899', isDefault: true, order: 10 },
  { id: 'travel',     name: '旅行',     type: 'expense', icon: 'plane',            color: '#a855f7', isDefault: true, order: 11 },
  { id: 'other-expense', name: '其他',  type: 'expense', icon: 'more-horizontal',  color: '#64748b', isDefault: true, order: 12 },
]

export const defaultIncomeCategories: Category[] = [
  { id: 'salary',     name: '工资',     type: 'income', icon: 'briefcase',    color: '#10b981', isDefault: true, order: 1 },
  { id: 'freelance',  name: '兼职',     type: 'income', icon: 'laptop',       color: '#3b82f6', isDefault: true, order: 2 },
  { id: 'investment', name: '投资',     type: 'income', icon: 'trending-up',  color: '#8b5cf6', isDefault: true, order: 3 },
  { id: 'gift',       name: '红包',     type: 'income', icon: 'gift',         color: '#f59e0b', isDefault: true, order: 4 },
  { id: 'other-income', name: '其他',   type: 'income', icon: 'more-horizontal', color: '#64748b', isDefault: true, order: 5 },
]

export const defaultCategories: Category[] = [
  ...defaultExpenseCategories,
  ...defaultIncomeCategories,
]
