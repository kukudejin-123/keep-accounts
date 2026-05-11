'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { getCurrentYearMonth } from '@/lib/utils'

interface MonthContextType {
  year: number
  month: number
  setMonth: (year: number, month: number) => void
}

const MonthContext = createContext<MonthContextType>({
  ...getCurrentYearMonth(),
  setMonth: () => {},
})

export function useMonth() {
  return useContext(MonthContext)
}

export function MonthProvider({ children }: { children: ReactNode }) {
  const [{ year, month }, setState] = useState(getCurrentYearMonth())

  const setMonth = (y: number, m: number) => setState({ year: y, month: m })

  return (
    <MonthContext.Provider value={{ year, month, setMonth }}>
      {children}
    </MonthContext.Provider>
  )
}
