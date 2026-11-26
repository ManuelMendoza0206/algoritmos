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
  stopOrder: 1 | 2       // 1 = Parada Inmediata, 2 = En Cola Secuencial
  fromLocation: Point    // Origin of this leg (Brigade location or Stop 1 incident location)
  distanceKm: number     // Length of this leg only
  etaMinutes: number     // Travel time of this leg only
  cumulativeEtaMinutes: number // Arrival time since dispatch, including service time
  cellCost: number       // Cost used by the Hungarian solver for this leg
}

export interface DispatchOutcome {
  mode: DispatchMode
  assignments: DispatchAssignment[]
  immediateAssignments: DispatchAssignment[] // Stop 1
  queuedAssignments: DispatchAssignment[]    // Stop 2
  unassignedIncidents: Incident[]
  unassignedBrigades: Brigade[]
  costMatrix: number[][]
  distanceMatrix: number[][]
  hungarian: HungarianResult
  kpis: {
    avgEtaMinutes: number          // Mean arrival time across every served incident
    criticalEtaMinutes: number     // Mean arrival time for Alta / Crítica incidents
    criticalCoveragePercent: number // Critical incidents served at stop 1
    globalCostIndex: number        // Sum of both Hungarian stages
    totalDistanceKm: number
    queuedIncidentsCount: number
  }
}
