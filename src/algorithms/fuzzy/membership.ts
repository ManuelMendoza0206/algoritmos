import type { FuzzySetDefinition } from './types.ts'

/**
 * Triangular membership function trimf(x, [a, b, c])
 */
export function trimf(x: number, [a, b, c]: [number, number, number]): number {
  if (x <= a || x >= c) return 0
  if (x === b) return 1
  if (x < b) return (x - a) / (b - a)
  return (c - x) / (c - b)
}

/**
 * Trapezoidal membership function trapmf(x, [a, b, c, d])
 */
export function trapmf(x: number, [a, b, c, d]: [number, number, number, number]): number {
  if (x <= a || x >= d) return 0
  if (x >= b && x <= c) return 1
  if (x < b) return (x - a) / (b - a)
  return (d - x) / (d - c)
}

/**
 * Evaluates membership of x in a given fuzzy set definition
 */
export function evaluateMembership(x: number, set: FuzzySetDefinition): number {
  if (set.type === 'triangular') {
    return trimf(x, set.params)
  }
  return trapmf(x, set.params)
}
