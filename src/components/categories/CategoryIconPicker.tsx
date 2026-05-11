'use client'

import {
  UtensilsCrossed, Car, ShoppingBag, Gamepad2, Home, Zap, Heart, BookOpen,
  Smartphone, Shirt, Plane, MoreHorizontal, Briefcase, Laptop, TrendingUp,
  Gift, type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'utensils-crossed': UtensilsCrossed,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'gamepad-2': Gamepad2,
  'home': Home,
  'zap': Zap,
  'heart': Heart,
  'book-open': BookOpen,
  'smartphone': Smartphone,
  'shirt': Shirt,
  'plane': Plane,
  'more-horizontal': MoreHorizontal,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'gift': Gift,
}

export const availableIcons = Object.keys(iconMap)

export function getIconComponent(name: string): LucideIcon {
  return iconMap[name] || MoreHorizontal
}

interface CategoryIconPickerProps {
  selected: string
  onSelect: (icon: string) => void
}

export function CategoryIconPicker({ selected, onSelect }: CategoryIconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {availableIcons.map(name => {
        const Icon = iconMap[name]
        const isSelected = selected === name
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isSelected
                ? 'bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-400/50'
                : 'hover:bg-white/30 text-gray-500'
            }`}
          >
            <Icon size={20} className="mx-auto" />
          </button>
        )
      })}
    </div>
  )
}
