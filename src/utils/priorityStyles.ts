import type { PriorityLevel } from '../algorithms/fuzzy/types.ts'

export interface PriorityStyle {
  border: string
  bg: string
  text: string
  ring: string
  badgeBg: string
  badgeText: string
  glow: string
  fillColor: string
}

export function getPriorityStyle(level: PriorityLevel): PriorityStyle {
  switch (level) {
    case 'Crítica':
      return {
        border: 'border-rose-300',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        ring: 'ring-rose-400',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800 border-rose-200',
        glow: 'shadow-[0_4px_14px_rgba(225,29,72,0.2)]',
        fillColor: '#e11d48',
      }
    case 'Alta':
      return {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        ring: 'ring-orange-400',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800 border-orange-200',
        glow: 'shadow-[0_4px_12px_rgba(234,88,12,0.18)]',
        fillColor: '#ea580c',
      }
    case 'Media':
      return {
        border: 'border-amber-300',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        ring: 'ring-amber-400',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900 border-amber-200',
        glow: 'shadow-[0_4px_10px_rgba(217,119,6,0.15)]',
        fillColor: '#d97706',
      }
    case 'Baja':
    default:
      return {
        border: 'border-emerald-300',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-400',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800 border-emerald-200',
        glow: 'shadow-[0_4px_10px_rgba(5,150,105,0.15)]',
        fillColor: '#059669',
      }
  }
}
