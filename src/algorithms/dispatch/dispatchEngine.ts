import type { Brigade, Incident, DispatchMode, DispatchOutcome, DispatchAssignment } from '../../types/dispatch.ts'
import { solveHungarian } from '../hungarian/hungarianAlgorithm.ts'

const MAP_WIDTH_KM = 25 // 100 map units = 25 kilometers in tactical grid

/**
 * Calculates euclidean distance between two points in kilometers
 */
export function calculateDistanceKm(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = (p1.x - p2.x) * (MAP_WIDTH_KM / 100)
  const dy = (p1.y - p2.y) * (MAP_WIDTH_KM / 100)
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Generates cost matrix and runs assignment algorithm based on selected mode:
 * - 'classic': Pure Distance Minimization: Cost = Distance (km)
 * - 'smart': Multi-Criteria Risk-Weighted Delay:
 *     Cost = ETA(i, j) * RiskMultiplier(Priority_j) * SpecialtyCompatibility
 *     where RiskMultiplier increases non-linearly with Mamdani Priority.
 */
export function runDispatchEngine(
  brigades: Brigade[],
  incidents: Incident[],
  mode: DispatchMode
): DispatchOutcome {
  if (brigades.length === 0 || incidents.length === 0) {
    return {
      mode,
      assignments: [],
      unassignedIncidents: [...incidents],
      unassignedBrigades: [...brigades],
      costMatrix: [],
      distanceMatrix: [],
      hungarian: { assignments: [], totalCost: 0, originalMatrix: [], steps: [] },
      kpis: {
        avgEtaMinutes: 0,
        criticalCoveragePercent: 0,
        globalCostIndex: 0,
        totalDistanceKm: 0,
      },
    }
  }

  const numB = brigades.length
  const numI = incidents.length

  // Build distance and ETA matrices
  const distanceMatrix: number[][] = []
  const etaMatrix: number[][] = []

  for (let b = 0; b < numB; b++) {
    const distRow: number[] = []
    const etaRow: number[] = []
    for (let i = 0; i < numI; i++) {
      const dist = calculateDistanceKm(brigades[b].location, incidents[i].location)
      const eta = (dist / brigades[b].speedKmH) * 60
      distRow.push(Number(dist.toFixed(2)))
      etaRow.push(Number(eta.toFixed(1)))
    }
    distanceMatrix.push(distRow)
    etaMatrix.push(etaRow)
  }

  // Build cost matrix
  const costMatrix: number[][] = []

  for (let b = 0; b < numB; b++) {
    const row: number[] = []
    for (let i = 0; i < numI; i++) {
      const dist = distanceMatrix[b][i]
      const eta = etaMatrix[b][i]
      const prio = incidents[i].mamdani.score // 0 to 100

      if (mode === 'classic') {
        // Pure distance / proximity heuristic
        row.push(Number(dist.toFixed(2)))
      } else {
        // Smart Mode: Delay Cost weighted by Mamdani Risk Factor
        // Low priority (10) -> multiplier ~ 0.8 (delay has very low penalty)
        // High priority (95) -> multiplier ~ 3.2 (delay is critical)
        // This makes high priority emergencies attract faster/closer units aggressively.
        const riskMultiplier = 0.5 + 2.8 * (prio / 100)
        const cellCost = eta * riskMultiplier
        row.push(Number(cellCost.toFixed(2)))
      }
    }
    costMatrix.push(row)
  }

  // Solve with Hungarian algorithm
  const hungarian = solveHungarian(costMatrix)

  // Map pairings to domain assignments
  const assignments: DispatchAssignment[] = []
  const assignedBrigadeIndices = new Set<number>()
  const assignedIncidentIndices = new Set<number>()

  for (const [bIdx, iIdx] of hungarian.assignments) {
    if (bIdx < numB && iIdx < numI) {
      const brigade = brigades[bIdx]
      const incident = incidents[iIdx]
      const distKm = distanceMatrix[bIdx][iIdx]
      const etaMinutes = etaMatrix[bIdx][iIdx]
      const cellCost = costMatrix[bIdx][iIdx]

      const prio = incident.mamdani.score
      const riskMultiplier = 0.5 + 2.8 * (prio / 100)
      const urgencyCost = Number((etaMinutes * (riskMultiplier - 0.5)).toFixed(2))
      const distanceCost = Number((etaMinutes * 0.5).toFixed(2))

      assignments.push({
        brigadeId: brigade.id,
        brigade,
        incidentId: incident.id,
        incident,
        distanceKm: distKm,
        etaMinutes: etaMinutes,
        cellCost,
        distanceCost,
        urgencyCost,
      })

      assignedBrigadeIndices.add(bIdx)
      assignedIncidentIndices.add(iIdx)
    }
  }

  const unassignedBrigades = brigades.filter((_, idx) => !assignedBrigadeIndices.has(idx))
  const unassignedIncidents = incidents.filter((_, idx) => !assignedIncidentIndices.has(idx))

  // Calculate KPIs
  const totalDistanceKm = assignments.reduce((acc, a) => acc + a.distanceKm, 0)
  const avgEtaMinutes = assignments.length > 0
    ? assignments.reduce((acc, a) => acc + a.etaMinutes, 0) / assignments.length
    : 0

  const criticalIncidents = incidents.filter(i => i.mamdani.level === 'Crítica' || i.mamdani.level === 'Alta')
  const coveredCritical = criticalIncidents.filter(ci =>
    assignments.some(a => a.incidentId === ci.id)
  )
  const criticalCoveragePercent = criticalIncidents.length > 0
    ? (coveredCritical.length / criticalIncidents.length) * 100
    : 100

  return {
    mode,
    assignments,
    unassignedIncidents,
    unassignedBrigades,
    costMatrix,
    distanceMatrix,
    hungarian,
    kpis: {
      avgEtaMinutes: Number(avgEtaMinutes.toFixed(1)),
      criticalCoveragePercent: Math.round(criticalCoveragePercent),
      globalCostIndex: hungarian.totalCost,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    },
  }
}
