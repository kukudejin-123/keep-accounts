'use client'

import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl p-5 shadow-lg shadow-black/5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-xl hover:shadow-black/10 active:scale-[0.98]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
