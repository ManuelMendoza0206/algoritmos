import type { MamdaniResult } from '../algorithms/fuzzy/types.ts'
import type { HungarianResult } from '../algorithms/hungarian/types.ts'

export interface Point {
  x: number // 0 to 100 percentage in map
  y: number // 0 to 100 percentage in map
}

export interface Brigade {
  id: string
  code: string
  name: string
  location: Point
  specialty: 'Soporte Vital' | 'Rescate e Incendios' | 'Redes y Energía'
  speedKmH: number
  status: 'available' | 'dispatched'
}

export interface Incident {
  id: string
  code: string
  title: string
  sector: string
  location: Point
  severity: number   // 0 - 10
  impact: number     // 0 - 10
  waitTime: number   // 0 - 180 min
  mamdani: MamdaniResult
}

export type DispatchMode = 'classic' | 'smart'

export interface DispatchAssignment {
  brigadeId: string
  brigade: Brigade
  incidentId: string
  incident: Incident
  distanceKm: number
  etaMinutes: number
  cellCost: number
  distanceCost: number
  urgencyCost: number
}

export interface DispatchOutcome {
  mode: DispatchMode
  assignments: DispatchAssignment[]
  unassignedIncidents: Incident[]
  unassignedBrigades: Brigade[]
  costMatrix: number[][]
  distanceMatrix: number[][]
  hungarian: HungarianResult
  kpis: {
    avgEtaMinutes: number
    criticalCoveragePercent: number
    globalCostIndex: number
    totalDistanceKm: number
  }
}
