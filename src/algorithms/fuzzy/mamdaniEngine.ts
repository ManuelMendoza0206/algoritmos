import { evaluateMembership } from './membership.ts'
import type { FuzzyInputs, FuzzySetDefinition, MamdaniResult, PriorityLevel, ActiveRule } from './types.ts'

export const SEVERITY_SETS: Record<string, FuzzySetDefinition> = {
  Baja: { type: 'trapezoidal', params: [0, 0, 2, 4.5] },
  Media: { type: 'triangular', params: [3, 5, 7] },
  Alta: { type: 'trapezoidal', params: [5.5, 8, 10, 10] },
}

export const IMPACT_SETS: Record<string, FuzzySetDefinition> = {
  Leve: { type: 'trapezoidal', params: [0, 0, 2, 4.5] },
  Moderado: { type: 'triangular', params: [3, 5, 7] },
  Critico: { type: 'trapezoidal', params: [5.5, 8, 10, 10] },
}

export const WAIT_TIME_SETS: Record<string, FuzzySetDefinition> = {
  Reciente: { type: 'trapezoidal', params: [0, 0, 20, 45] },
  Moderado: { type: 'triangular', params: [30, 60, 90] },
  Prolongado: { type: 'trapezoidal', params: [75, 120, 180, 180] },
}

export const PRIORITY_SETS: Record<PriorityLevel, FuzzySetDefinition> = {
  Baja: { type: 'trapezoidal', params: [0, 0, 15, 30] },
  Media: { type: 'triangular', params: [25, 45, 65] },
  Alta: { type: 'triangular', params: [55, 75, 88] },
  'Crítica': { type: 'trapezoidal', params: [80, 92, 100, 100] },
}

interface RuleSpec {
  id: string
  sev: 'Baja' | 'Media' | 'Alta'
  imp: 'Leve' | 'Moderado' | 'Critico'
  wait: 'Reciente' | 'Moderado' | 'Prolongado'
  consequent: PriorityLevel
}

// Complete 27-rule knowledge base for emergency dispatch
export const MAMDANI_RULES: RuleSpec[] = [
  // Severity Baja
  { id: 'R01', sev: 'Baja', imp: 'Leve', wait: 'Reciente', consequent: 'Baja' },
  { id: 'R02', sev: 'Baja', imp: 'Leve', wait: 'Moderado', consequent: 'Baja' },
  { id: 'R03', sev: 'Baja', imp: 'Leve', wait: 'Prolongado', consequent: 'Media' },
  { id: 'R04', sev: 'Baja', imp: 'Moderado', wait: 'Reciente', consequent: 'Baja' },
  { id: 'R05', sev: 'Baja', imp: 'Moderado', wait: 'Moderado', consequent: 'Media' },
  { id: 'R06', sev: 'Baja', imp: 'Moderado', wait: 'Prolongado', consequent: 'Media' },
  { id: 'R07', sev: 'Baja', imp: 'Critico', wait: 'Reciente', consequent: 'Media' },
  { id: 'R08', sev: 'Baja', imp: 'Critico', wait: 'Moderado', consequent: 'Alta' },
  { id: 'R09', sev: 'Baja', imp: 'Critico', wait: 'Prolongado', consequent: 'Alta' },

  // Severity Media
  { id: 'R10', sev: 'Media', imp: 'Leve', wait: 'Reciente', consequent: 'Baja' },
  { id: 'R11', sev: 'Media', imp: 'Leve', wait: 'Moderado', consequent: 'Media' },
  { id: 'R12', sev: 'Media', imp: 'Leve', wait: 'Prolongado', consequent: 'Alta' },
  { id: 'R13', sev: 'Media', imp: 'Moderado', wait: 'Reciente', consequent: 'Media' },
  { id: 'R14', sev: 'Media', imp: 'Moderado', wait: 'Moderado', consequent: 'Alta' },
  { id: 'R15', sev: 'Media', imp: 'Moderado', wait: 'Prolongado', consequent: 'Alta' },
  { id: 'R16', sev: 'Media', imp: 'Critico', wait: 'Reciente', consequent: 'Alta' },
  { id: 'R17', sev: 'Media', imp: 'Critico', wait: 'Moderado', consequent: 'Alta' },
  { id: 'R18', sev: 'Media', imp: 'Critico', wait: 'Prolongado', consequent: 'Crítica' },

  // Severity Alta
  { id: 'R19', sev: 'Alta', imp: 'Leve', wait: 'Reciente', consequent: 'Media' },
  { id: 'R20', sev: 'Alta', imp: 'Leve', wait: 'Moderado', consequent: 'Alta' },
  { id: 'R21', sev: 'Alta', imp: 'Leve', wait: 'Prolongado', consequent: 'Alta' },
  { id: 'R22', sev: 'Alta', imp: 'Moderado', wait: 'Reciente', consequent: 'Alta' },
  { id: 'R23', sev: 'Alta', imp: 'Moderado', wait: 'Moderado', consequent: 'Alta' },
  { id: 'R24', sev: 'Alta', imp: 'Moderado', wait: 'Prolongado', consequent: 'Crítica' },
  { id: 'R25', sev: 'Alta', imp: 'Critico', wait: 'Reciente', consequent: 'Alta' },
  { id: 'R26', sev: 'Alta', imp: 'Critico', wait: 'Moderado', consequent: 'Crítica' },
  { id: 'R27', sev: 'Alta', imp: 'Critico', wait: 'Prolongado', consequent: 'Crítica' },
]

/**
 * Executes full Mamdani Fuzzy Inference:
 * 1. Fuzzification of crisp inputs
 * 2. Rule evaluation with T-norm Min
 * 3. Aggregation of consequents with S-norm Max
 * 4. Centroid Defuzzification
 */
export function evaluateMamdani(inputs: FuzzyInputs): MamdaniResult {
  // 1. Fuzzification
  const muSev: Record<string, number> = {}
  for (const [k, v] of Object.entries(SEVERITY_SETS)) {
    muSev[k] = evaluateMembership(inputs.severity, v)
  }

  const muImp: Record<string, number> = {}
  for (const [k, v] of Object.entries(IMPACT_SETS)) {
    muImp[k] = evaluateMembership(inputs.impact, v)
  }

  const muWait: Record<string, number> = {}
  for (const [k, v] of Object.entries(WAIT_TIME_SETS)) {
    muWait[k] = evaluateMembership(inputs.waitTime, v)
  }

  // 2. Inference: Evaluate rules with min operator
  const activeRules: ActiveRule[] = []
  const ruleFirings: { consequent: PriorityLevel; strength: number }[] = []

  for (const r of MAMDANI_RULES) {
    const sVal = muSev[r.sev] ?? 0
    const iVal = muImp[r.imp] ?? 0
    const wVal = muWait[r.wait] ?? 0
    const alpha = Math.min(sVal, iVal, wVal)

    if (alpha > 0.001) {
      activeRules.push({
        id: r.id,
        antecedents: [
          { variable: 'Gravedad', term: r.sev, membership: sVal },
          { variable: 'Impacto', term: r.imp, membership: iVal },
          { variable: 'Espera', term: r.wait, membership: wVal },
        ],
        consequent: { term: r.consequent },
        firingStrength: alpha,
        description: `${r.id}: Si Grav=${r.sev} (${sVal.toFixed(2)}) ∧ Imp=${r.imp} (${iVal.toFixed(2)}) ∧ Esp=${r.wait} (${wVal.toFixed(2)}) → ${r.consequent}`,
      })
      ruleFirings.push({ consequent: r.consequent, strength: alpha })
    }
  }

  // Sort active rules by strength descending
  activeRules.sort((a, b) => b.firingStrength - a.firingStrength)

  // 3. Aggregation across universe of discourse [0, 100] (201 discrete points)
  const STEPS = 200
  const aggregationCurve: { x: number; y: number }[] = []
  let numerator = 0
  let denominator = 0

  for (let i = 0; i <= STEPS; i++) {
    const x = (i / STEPS) * 100
    let aggregatedMu = 0

    // S-norm Max across all fired rules
    for (const rf of ruleFirings) {
      const setDef = PRIORITY_SETS[rf.consequent]
      const termMu = evaluateMembership(x, setDef)
      const truncatedMu = Math.min(rf.strength, termMu)
      if (truncatedMu > aggregatedMu) {
        aggregatedMu = truncatedMu
      }
    }

    aggregationCurve.push({ x, y: aggregatedMu })
    numerator += x * aggregatedMu
    denominator += aggregatedMu
  }

  // 4. Centroid Defuzzification
  let score = denominator > 0.0001 ? numerator / denominator : 50
  score = Math.max(0, Math.min(100, score))

  // Determine categorical label
  let level: PriorityLevel = 'Baja'
  if (score >= 82) {
    level = 'Crítica'
  } else if (score >= 60) {
    level = 'Alta'
  } else if (score >= 35) {
    level = 'Media'
  } else {
    level = 'Baja'
  }

  return {
    score: Number(score.toFixed(1)),
    level,
    activeRules,
    aggregationCurve,
    inputMemberships: {
      severity: muSev,
      impact: muImp,
      waitTime: muWait,
    },
  }
}
