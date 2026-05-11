'use client'

import { LayoutDashboard, ArrowUpDown, Repeat, Tags } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/transactions', label: '交易', icon: ArrowUpDown },
  { href: '/subscriptions', label: '订阅', icon: Repeat },
  { href: '/categories', label: '分类', icon: Tags },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1">
        {tabs.map(tab => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[64px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 bg-emerald-500/15'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/20'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
