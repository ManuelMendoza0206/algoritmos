import { runDispatchEngine } from './dispatchEngine.ts'
import { evaluateMamdani } from '../fuzzy/mamdaniEngine.ts'
import type { Brigade, Incident } from '../../types/dispatch.ts'

const brigades: Brigade[] = [
  { id: 'B1', code: 'B1', name: 'Unidad 1', location: { x: 50, y: 50 }, specialty: 'Soporte Vital', speedKmH: 50, status: 'available' },
]

const incidents: Incident[] = [
  {
    id: 'I1', code: 'I1', title: 'Incidente Crítico', sector: 'Centro', location: { x: 50, y: 60 },
    severity: 9.9, impact: 9.9, waitTime: 120,
    mamdani: evaluateMamdani({ severity: 9.9, impact: 9.9, waitTime: 120 }) // Score ~92
  },
  {
    id: 'I2', code: 'I2', title: 'Incidente Trivial', sector: 'Centro', location: { x: 50, y: 60 },
    severity: 1.0, impact: 1.0, waitTime: 5,
    mamdani: evaluateMamdani({ severity: 1.0, impact: 1.0, waitTime: 5 }) // Score ~11
  }
]

console.log('Incident 1 (Crítico) Score:', incidents[0].mamdani.score)
console.log('Incident 2 (Trivial) Score:', incidents[1].mamdani.score)

const outcome = runDispatchEngine(brigades, incidents, 'smart')
console.log('Assignments when M=1 and N=2:')
outcome.assignments.forEach(a => console.log(`  Brigade ${a.brigade.name} -> Assigned to ${a.incident.title} (Score: ${a.incident.mamdani.score}, Cost: ${a.cellCost})`))
console.log('Unassigned Incidents:', outcome.unassignedIncidents.map(i => i.title))
