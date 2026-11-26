export type LinguisticVariable = {
  name: string
  range: [number, number]
  sets: Record<string, FuzzySetDefinition>
}

export type FuzzySetDefinition = 
  | { type: 'triangular'; params: [number, number, number] }
  | { type: 'trapezoidal'; params: [number, number, number, number] }

export interface FuzzyInputs {
  severity: number   // 0 - 10
  impact: number     // 0 - 10
  waitTime: number   // 0 - 180 (minutes)
}

export type PriorityLevel = 'Baja' | 'Media' | 'Alta' | 'Crítica'

export interface ActiveRule {
  id: string
  antecedents: {
    variable: string
    term: string
    membership: number
  }[]
  consequent: {
    term: PriorityLevel
  }
  firingStrength: number // alpha cut
  description: string
}

export interface MamdaniResult {
  score: number           // Centroid defuzzified score (0 - 100)
  level: PriorityLevel    // Linguistic category
  activeRules: ActiveRule[]
  aggregationCurve: { x: number; y: number }[]
  inputMemberships: {
    severity: Record<string, number>
    impact: Record<string, number>
    waitTime: Record<string, number>
  }
}
