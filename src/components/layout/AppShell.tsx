'use client'

import { type ReactNode } from 'react'
import { MonthProvider } from './MonthContext'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MonthProvider>
      <div className="max-w-lg mx-auto px-4 pb-24 pt-2 min-h-screen">
        <Header />
        <main className="mt-2">
          {children}
        </main>
      </div>
      <BottomNav />
    </MonthProvider>
  )
}
