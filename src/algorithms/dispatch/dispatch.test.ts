import { calculateDistanceKm, runDispatchEngine } from './dispatchEngine.ts'
import { evaluateMamdani } from '../fuzzy/mamdaniEngine.ts'
import type { Brigade, Incident } from '../../types/dispatch.ts'

// Coordinates setup:
// B1 at (20, 20)
// B2 at (85, 85)
// I1 (Hospital - Crítica) at (35, 35)
// I2 (Plaza - Leve) at (25, 25)
const brigades: Brigade[] = [
  { id: 'B1', code: 'B-ALFA', name: 'Brigada Alfa (Urgencias)', location: { x: 20, y: 20 }, specialty: 'Soporte Vital', speedKmH: 50, status: 'available' },
  { id: 'B2', code: 'B-BETA', name: 'Brigada Beta (Apoyo)', location: { x: 85, y: 85 }, specialty: 'Redes y Energía', speedKmH: 40, status: 'available' },
]

const incidents: Incident[] = [
  {
    id: 'I1',
    code: 'INC-HOSP',
    title: 'Hospital Central - Falla Eléctrica UCI',
    sector: 'Distrito Médico',
    location: { x: 38, y: 38 },
    severity: 9.8,
    impact: 9.9,
    waitTime: 70,
    mamdani: evaluateMamdani({ severity: 9.8, impact: 9.9, waitTime: 70 }),
  },
  {
    id: 'I2',
    code: 'INC-PLAZA',
    title: 'Plaza Mayor - Foco Fundido',
    sector: 'Casco Histórico',
    location: { x: 24, y: 24 },
    severity: 1.2,
    impact: 1.0,
    waitTime: 10,
    mamdani: evaluateMamdani({ severity: 1.2, impact: 1.0, waitTime: 10 }),
  },
]

console.log('--- TEST: Clásico vs Inteligente ---')
const classic = runDispatchEngine(brigades, incidents, 'classic')
console.log('Modo Clásico (Distancia pura):')
classic.assignments.forEach(a => console.log(`  ${a.brigade.name} -> ${a.incident.title} (Dist: ${a.distanceKm}km, ETA: ${a.etaMinutes}min)`))

const smart = runDispatchEngine(brigades, incidents, 'smart')
console.log('\nModo Inteligente (Mamdani + Húngaro):')
smart.assignments.forEach(a => console.log(`  ${a.brigade.name} -> ${a.incident.title} (Dist: ${a.distanceKm}km, Mamdani: ${a.incident.mamdani.score}, ETA: ${a.etaMinutes}min)`))
