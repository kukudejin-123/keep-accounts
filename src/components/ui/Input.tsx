'use client'

import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={`glass-input rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400/50 focus:bg-white/40 ${className}`}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  )
}
