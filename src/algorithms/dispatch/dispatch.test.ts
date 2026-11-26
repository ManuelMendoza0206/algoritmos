import test from 'node:test'
import assert from 'node:assert/strict'
import { runDispatchEngine, riskMultiplier, SERVICE_TIME_MIN } from './dispatchEngine.ts'
import { evaluateMamdani } from '../fuzzy/mamdaniEngine.ts'
import { PRESET_SCENARIOS } from '../../data/presets.ts'
import type { Brigade, Incident } from '../../types/dispatch.ts'

function brigade(id: string, x: number, y: number, speedKmH = 50): Brigade {
  return {
    id,
    code: id,
    name: id,
    location: { x, y },
    specialty: 'Soporte Vital',
    speedKmH,
    status: 'available',
  }
}

function incident(
  id: string,
  x: number,
  y: number,
  inputs: { severity: number; impact: number; waitTime: number }
): Incident {
  return {
    id,
    code: id,
    title: id,
    sector: 'Test',
    location: { x, y },
    ...inputs,
    mamdani: evaluateMamdani(inputs),
  }
}

const preset = (id: string) => {
  const found = PRESET_SCENARIOS.find((p) => p.id === id)
  if (!found) throw new Error(`preset ${id} must exist`)
  return found
}

test('the smart cost is not priority-invariant: the flagship preset flips the greedy choice', () => {
  const { brigades, incidents } = preset('falla-critica')
  const classic = runDispatchEngine(brigades, incidents, 'classic')
  const smart = runDispatchEngine(brigades, incidents, 'smart')

  const classicRoute = classic.immediateAssignments.find((a) => a.brigadeId === 'B1')
  const smartRoute = smart.immediateAssignments.find((a) => a.brigadeId === 'B1')

  assert.equal(classicRoute?.incidentId, 'I2', 'classic sends U-01 to the trivial failure')
  assert.equal(smartRoute?.incidentId, 'I1', 'smart sends U-01 to the critical failure')
  assert.ok(
    smart.kpis.criticalEtaMinutes < classic.kpis.criticalEtaMinutes,
    'smart reaches the critical incident sooner'
  )
})

test('priority breaks a geometric tie (identical ETAs, different priorities)', () => {
  const { brigades, incidents } = preset('empate-distancias')
  const classic = runDispatchEngine(brigades, incidents, 'classic')
  const smart = runDispatchEngine(brigades, incidents, 'smart')

  const classicB1 = classic.immediateAssignments.find((a) => a.brigadeId === 'B1')
  const smartB1 = smart.immediateAssignments.find((a) => a.brigadeId === 'B1')

  assert.equal(classicB1?.etaMinutes, 10)
  assert.equal(classicB1?.incidentId, 'I2', 'distance alone picks the low-priority incident')
  assert.equal(smartB1?.incidentId, 'I1', 'priority picks the critical incident')
})

test('the risk multiplier grows with priority and stays inside its declared range', () => {
  assert.equal(riskMultiplier(0), 0.5)
  assert.equal(riskMultiplier(100), 3.3)
  assert.ok(riskMultiplier(90) > riskMultiplier(20))
  assert.equal(riskMultiplier(-50), riskMultiplier(0), 'clamps low values')
  assert.equal(riskMultiplier(500), riskMultiplier(100), 'clamps high values')
})

test('multi-stop dispatch serves a second incident with the same brigade', () => {
  const brigades = [brigade('B1', 50, 50)]
  const incidents = [
    incident('I1', 50, 30, { severity: 9.5, impact: 9.5, waitTime: 120 }),
    incident('I2', 50, 70, { severity: 2, impact: 2, waitTime: 5 }),
  ]

  const outcome = runDispatchEngine(brigades, incidents, 'smart')
  assert.equal(outcome.immediateAssignments.length, 1)
  assert.equal(outcome.queuedAssignments.length, 1)
  assert.equal(outcome.unassignedIncidents.length, 0)

  const [first] = outcome.immediateAssignments
  const [second] = outcome.queuedAssignments
  assert.equal(second.brigadeId, first.brigadeId)
  assert.equal(second.stopOrder, 2)
  assert.equal(second.fromLocation.x, first.incident.location.x)
  assert.equal(
    second.cumulativeEtaMinutes,
    Number((first.cumulativeEtaMinutes + SERVICE_TIME_MIN + second.etaMinutes).toFixed(1)),
    'stop 2 arrival includes stop 1 travel, service time and the second leg'
  )
})

test('deferring a critical incident is penalised when brigades are scarce', () => {
  const { brigades, incidents } = preset('hora-pico')
  const outcome = runDispatchEngine(brigades, incidents, 'smart')

  const criticalIds = incidents
    .filter((i) => i.mamdani.level === 'Crítica' || i.mamdani.level === 'Alta')
    .map((i) => i.id)
  const immediateIds = outcome.immediateAssignments.map((a) => a.incidentId)

  for (const id of criticalIds) {
    assert.ok(immediateIds.includes(id), `critical ${id} must be served at stop 1`)
  }
  assert.equal(outcome.queuedAssignments.length, 2)
})

test('a single brigade cannot serve more than two incidents', () => {
  const brigades = [brigade('B1', 50, 50)]
  const incidents = [
    incident('I1', 40, 40, { severity: 8, impact: 8, waitTime: 60 }),
    incident('I2', 60, 60, { severity: 5, impact: 5, waitTime: 30 }),
    incident('I3', 30, 70, { severity: 3, impact: 3, waitTime: 10 }),
  ]

  const outcome = runDispatchEngine(brigades, incidents, 'smart')
  assert.equal(outcome.assignments.length, 2)
  assert.equal(outcome.unassignedIncidents.length, 1)
})

test('empty inputs produce an empty outcome', () => {
  const outcome = runDispatchEngine([], [], 'smart')
  assert.equal(outcome.assignments.length, 0)
  assert.equal(outcome.kpis.avgEtaMinutes, 0)
  assert.equal(outcome.kpis.globalCostIndex, 0)
})
