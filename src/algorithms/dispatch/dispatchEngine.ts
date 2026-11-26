import type { Brigade, Incident, DispatchMode, DispatchOutcome, DispatchAssignment } from '../../types/dispatch.ts'
import { solveHungarian } from '../hungarian/hungarianAlgorithm.ts'

const MAP_WIDTH_KM = 25 // 100 map units = 25 kilometers in the tactical grid
export const SERVICE_TIME_MIN = 15 // Time a brigade spends at stop 1 before moving to stop 2
export const DEFERRAL_HORIZON_MIN = SERVICE_TIME_MIN + 10 // Approx. time until a busy brigade is free
export const RISK_BASE = 0.5
export const RISK_SPAN = 2.8

/**
 * Risk multiplier applied to the arrival time of an incident.
 *
 * The multiplier is a function of the Mamdani priority only, so the cost
 * C(i,j) = arrival(i,j) * multiplier(j) is NOT separable: the priority of an
 * incident cannot be cancelled out by adding a constant to a column. This is
 * what lets the Hungarian solver trade extra travel time for a critical case.
 */
export function riskMultiplier(priority: number): number {
  const clamped = Math.min(100, Math.max(0, priority))
  return RISK_BASE + RISK_SPAN * (clamped / 100)
}

/**
 * Calculates euclidean distance between two points in kilometers
 */
export function calculateDistanceKm(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = (p2.x - p1.x) * (MAP_WIDTH_KM / 100)
  const dy = (p2.y - p1.y) * (MAP_WIDTH_KM / 100)
  return Math.sqrt(dx * dx + dy * dy)
}

interface CostMatrices {
  costMatrix: number[][]
  distanceMatrix: number[][]
  legEtaMatrix: number[][]
  arrivalMatrix: number[][]
}

/**
 * Builds the Hungarian cost matrices.
 * - 'classic': Cost = distance (km) of the next leg.
 * - 'smart': Cost = arrival time (min) * riskMultiplier(priority).
 *
 * `baseMinutes[b]` is the time already spent by brigade `b` before starting
 * this leg (0 in stage 1, cumulative stop-1 time in stage 2).
 */
function buildCostMatrix(
  origins: { x: number; y: number }[],
  brigades: Brigade[],
  incidents: Incident[],
  mode: DispatchMode,
  baseMinutes: number[]
): CostMatrices {
  const costMatrix: number[][] = []
  const distanceMatrix: number[][] = []
  const legEtaMatrix: number[][] = []
  const arrivalMatrix: number[][] = []

  for (let b = 0; b < origins.length; b++) {
    const costRow: number[] = []
    const distRow: number[] = []
    const legEtaRow: number[] = []
    const arrivalRow: number[] = []

    const brigade = brigades[b]
    const origin = origins[b]

    for (let i = 0; i < incidents.length; i++) {
      const dist = calculateDistanceKm(origin, incidents[i].location)
      const legEta = (dist / brigade.speedKmH) * 60
      const arrival = baseMinutes[b] + legEta
      const priority = incidents[i].mamdani.score

      distRow.push(Number(dist.toFixed(2)))
      legEtaRow.push(Number(legEta.toFixed(1)))
      arrivalRow.push(Number(arrival.toFixed(1)))

      if (mode === 'classic') {
        costRow.push(Number(dist.toFixed(2)))
      } else {
        costRow.push(Number((arrival * riskMultiplier(priority)).toFixed(2)))
      }
    }

    costMatrix.push(costRow)
    distanceMatrix.push(distRow)
    legEtaMatrix.push(legEtaRow)
    arrivalMatrix.push(arrivalRow)
  }

  return { costMatrix, distanceMatrix, legEtaMatrix, arrivalMatrix }
}

/**
 * Solves one dispatch stage. When there are fewer brigades than incidents,
 * the missing rows are "deferral" rows: serving an incident later has a real
 * cost, so a critical incident must not be deferred just because a trivial one
 * is closer. Without that penalty the solver would cover the cheapest cells
 * and push the critical case to stop 2.
 */
function solveStage(
  costMatrix: number[][],
  mode: DispatchMode,
  priorities: number[]
) {
  const rows = costMatrix.length
  const cols = costMatrix[0].length

  if (rows >= cols) {
    return solveHungarian(costMatrix)
  }

  if (mode === 'classic') {
    // Classic has no priority signal: deferring is free, so the solver simply
    // covers the cheapest legs first.
    return solveHungarian(costMatrix)
  }

  const deferralCost = priorities.map((p) =>
    Number((DEFERRAL_HORIZON_MIN * riskMultiplier(p)).toFixed(2))
  )
  const padded = [
    ...costMatrix,
    ...Array.from({ length: cols - rows }, () => [...deferralCost]),
  ]
  const result = solveHungarian(padded)
  const assignments = result.assignments.filter(([r]) => r < rows)
  const totalCost = assignments.reduce((acc, [r, c]) => acc + costMatrix[r][c], 0)
  const steps = result.steps.map((step, index) =>
    index === result.steps.length - 1
      ? {
          ...step,
          description: `Coste real de las ${assignments.length} paradas inmediatas: ${totalCost.toFixed(2)}`,
        }
      : step
  )

  return {
    ...result,
    assignments,
    steps,
    totalCost: Number(totalCost.toFixed(2)),
    originalMatrix: costMatrix,
  }
}

function emptyOutcome(mode: DispatchMode, brigades: Brigade[], incidents: Incident[]): DispatchOutcome {  return {
    mode,
    assignments: [],
    immediateAssignments: [],
    queuedAssignments: [],
    unassignedIncidents: [...incidents],
    unassignedBrigades: [...brigades],
    costMatrix: [],
    distanceMatrix: [],
    hungarian: {
      assignments: [],
      totalCost: 0,
      originalMatrix: [],
      steps: [],
    },
    kpis: {
      avgEtaMinutes: 0,
      criticalEtaMinutes: 0,
      criticalCoveragePercent: 0,
      globalCostIndex: 0,
      totalDistanceKm: 0,
      queuedIncidentsCount: 0,
    },
  }
}

/**
 * Executes the 2-stage multi-stop dispatch engine:
 * - Stage 1: immediate dispatch for every available brigade (Parada 1).
 * - Stage 2: sequential queue (Parada 2) for remaining incidents when M < N.
 */
export function runDispatchEngine(
  brigades: Brigade[],
  incidents: Incident[],
  mode: DispatchMode
): DispatchOutcome {
  if (brigades.length === 0 || incidents.length === 0) {
    return emptyOutcome(mode, brigades, incidents)
  }

  // STAGE 1: immediate dispatch from brigade origins
  const stage1 = buildCostMatrix(
    brigades.map((b) => b.location),
    brigades,
    incidents,
    mode,
    brigades.map(() => 0)
  )
  const stage1Hungarian = solveStage(
    stage1.costMatrix,
    mode,
    incidents.map((i) => i.mamdani.score)
  )

  const immediateAssignments: DispatchAssignment[] = []
  const assignedIncidentIds = new Set<string>()
  const assignedBrigadeIndices = new Set<number>()

  for (const [bIdx, iIdx] of stage1Hungarian.assignments) {
    if (bIdx >= brigades.length || iIdx >= incidents.length) continue

    const brigade = brigades[bIdx]
    const incident = incidents[iIdx]
    const legEta = stage1.legEtaMatrix[bIdx][iIdx]

    immediateAssignments.push({
      brigadeId: brigade.id,
      brigade,
      incidentId: incident.id,
      incident,
      stopOrder: 1,
      fromLocation: brigade.location,
      distanceKm: stage1.distanceMatrix[bIdx][iIdx],
      etaMinutes: legEta,
      cumulativeEtaMinutes: legEta,
      cellCost: stage1.costMatrix[bIdx][iIdx],
    })

    assignedIncidentIds.add(incident.id)
    assignedBrigadeIndices.add(bIdx)
  }

  // STAGE 2: queue remaining incidents on brigades that already finished stop 1.
  // Origins are stop-1 incident locations; the clock includes service time.
  const remainingIncidents = incidents.filter((i) => !assignedIncidentIds.has(i.id))
  const queuedAssignments: DispatchAssignment[] = []

  if (remainingIncidents.length > 0 && immediateAssignments.length > 0) {
    const activeBrigades = immediateAssignments.map((a) => a.brigade)
    const stage2 = buildCostMatrix(
      immediateAssignments.map((a) => a.incident.location),
      activeBrigades,
      remainingIncidents,
      mode,
      immediateAssignments.map((a) => a.cumulativeEtaMinutes + SERVICE_TIME_MIN)
    )
    const stage2Hungarian = solveStage(
      stage2.costMatrix,
      mode,
      remainingIncidents.map((i) => i.mamdani.score)
    )

    for (const [bIdx, iIdx] of stage2Hungarian.assignments) {
      if (bIdx >= activeBrigades.length || iIdx >= remainingIncidents.length) continue

      const parent = immediateAssignments[bIdx]
      const incident = remainingIncidents[iIdx]

      queuedAssignments.push({
        brigadeId: parent.brigadeId,
        brigade: parent.brigade,
        incidentId: incident.id,
        incident,
        stopOrder: 2,
        fromLocation: parent.incident.location,
        distanceKm: stage2.distanceMatrix[bIdx][iIdx],
        etaMinutes: stage2.legEtaMatrix[bIdx][iIdx],
        cumulativeEtaMinutes: stage2.arrivalMatrix[bIdx][iIdx],
        cellCost: stage2.costMatrix[bIdx][iIdx],
      })

      assignedIncidentIds.add(incident.id)
    }
  }

  const allAssignments = [...immediateAssignments, ...queuedAssignments]
  const unassignedIncidents = incidents.filter((i) => !assignedIncidentIds.has(i.id))
  const unassignedBrigades = brigades.filter((_, idx) => !assignedBrigadeIndices.has(idx))

  const totalDistanceKm = allAssignments.reduce((acc, a) => acc + a.distanceKm, 0)
  const avgEtaMinutes =
    allAssignments.length > 0
      ? allAssignments.reduce((acc, a) => acc + a.cumulativeEtaMinutes, 0) / allAssignments.length
      : 0

  const criticalIncidents = incidents.filter(
    (i) => i.mamdani.level === 'Crítica' || i.mamdani.level === 'Alta'
  )
  const criticalAssignments = allAssignments.filter(
    (a) => a.incident.mamdani.level === 'Crítica' || a.incident.mamdani.level === 'Alta'
  )
  const criticalEtaMinutes =
    criticalAssignments.length > 0
      ? criticalAssignments.reduce((acc, a) => acc + a.cumulativeEtaMinutes, 0) /
        criticalAssignments.length
      : 0
  const criticalAtStop1 = criticalIncidents.filter((ci) =>
    immediateAssignments.some((a) => a.incidentId === ci.id)
  )
  const criticalCoveragePercent =
    criticalIncidents.length > 0
      ? (criticalAtStop1.length / criticalIncidents.length) * 100
      : 100

  return {
    mode,
    assignments: allAssignments,
    immediateAssignments,
    queuedAssignments,
    unassignedIncidents,
    unassignedBrigades,
    costMatrix: stage1.costMatrix,
    distanceMatrix: stage1.distanceMatrix,
    hungarian: stage1Hungarian,
    kpis: {
      avgEtaMinutes: Number(avgEtaMinutes.toFixed(1)),
      criticalEtaMinutes: Number(criticalEtaMinutes.toFixed(1)),
      criticalCoveragePercent: Math.round(criticalCoveragePercent),
      globalCostIndex: Number(
        allAssignments.reduce((acc, a) => acc + a.cellCost, 0).toFixed(2)
      ),
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      queuedIncidentsCount: queuedAssignments.length,
    },
  }
}
