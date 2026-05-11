'use client'

import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-white/30 text-gray-600',
    success: 'bg-emerald-500/20 text-emerald-700',
    warning: 'bg-amber-500/20 text-amber-700',
    danger: 'bg-rose-500/20 text-rose-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
