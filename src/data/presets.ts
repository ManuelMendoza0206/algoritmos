import type { Brigade, Incident } from '../types/dispatch.ts'
import { evaluateMamdani } from '../algorithms/fuzzy/mamdaniEngine.ts'

export interface ScenarioPreset {
  id: string
  name: string
  tagline: string
  description: string
  brigades: Brigade[]
  incidents: Incident[]
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'falla-critica',
    name: 'Falla Crítica vs Falla Leve',
    tagline: 'Priorización de vida sobre proximidad',
    description: 'En Modo Clásico, la unidad Alfa se despacha a la falla leve por estar a 1 km, obligando a enviar una unidad lejana al hospital con 25 min de retraso. En Modo Inteligente, Mamdani detecta la emergencia crítica y el Húngaro reasigna a Alfa al hospital.',
    brigades: [
      {
        id: 'B1',
        code: 'B-ALFA',
        name: 'Brigada Alfa (Urgencias)',
        location: { x: 20, y: 20 },
        specialty: 'Soporte Vital',
        speedKmH: 50,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'B-BETA',
        name: 'Brigada Beta (Apoyo)',
        location: { x: 85, y: 85 },
        specialty: 'Redes y Energía',
        speedKmH: 40,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-HOSP',
        title: 'Hospital Central - Falla Eléctrica UCI',
        sector: 'Distrito Médico Norte',
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
    ],
  },
  {
    id: 'hora-pico',
    name: 'Hora Pico Urbana (4x4)',
    tagline: 'Optimización multizona coordinada',
    description: 'Despacho simultáneo de 4 cuadrantes urbanos: centro, norte, sureste y costa oeste. Resuelve saturación sin cruces ineficientes.',
    brigades: [
      {
        id: 'B1',
        code: 'B-ALFA',
        name: 'Unidad 01 - Centro',
        location: { x: 45, y: 48 },
        specialty: 'Soporte Vital',
        speedKmH: 50,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'B-BETA',
        name: 'Unidad 02 - Norte',
        location: { x: 30, y: 20 },
        specialty: 'Redes y Energía',
        speedKmH: 45,
        status: 'available',
      },
      {
        id: 'B3',
        code: 'B-GAMMA',
        name: 'Unidad 03 - Sur Este',
        location: { x: 75, y: 70 },
        specialty: 'Rescate e Incendios',
        speedKmH: 48,
        status: 'available',
      },
      {
        id: 'B4',
        code: 'B-DELTA',
        name: 'Unidad 04 - Costa Oeste',
        location: { x: 18, y: 65 },
        specialty: 'Soporte Vital',
        speedKmH: 52,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-TRAF',
        title: 'Colisión Múltiple en Autopista Central',
        sector: 'Nodo Conexión A-1',
        location: { x: 52, y: 40 },
        severity: 8.5,
        impact: 8.9,
        waitTime: 35,
        mamdani: evaluateMamdani({ severity: 8.5, impact: 8.9, waitTime: 35 }),
      },
      {
        id: 'I2',
        code: 'INC-SUBE',
        title: 'Explosión de Transformador en Subestación',
        sector: 'Parque Industrial Sur',
        location: { x: 80, y: 82 },
        severity: 9.2,
        impact: 9.4,
        waitTime: 50,
        mamdani: evaluateMamdani({ severity: 9.2, impact: 9.4, waitTime: 50 }),
      },
      {
        id: 'I3',
        code: 'INC-AGUA',
        title: 'Fuga de Agua en Vía Secundaria',
        sector: 'Barrio Residencial Norte',
        location: { x: 35, y: 15 },
        severity: 3.2,
        impact: 2.8,
        waitTime: 20,
        mamdani: evaluateMamdani({ severity: 3.2, impact: 2.8, waitTime: 20 }),
      },
      {
        id: 'I4',
        code: 'INC-SEMA',
        title: 'Semáforos Fuera de Servicio',
        sector: 'Avenida Costanera Oeste',
        location: { x: 22, y: 55 },
        severity: 4.8,
        impact: 5.5,
        waitTime: 80,
        mamdani: evaluateMamdani({ severity: 4.8, impact: 5.5, waitTime: 80 }),
      },
    ],
  },
  {
    id: 'empate-distancias',
    name: 'Empate de Distancias',
    tagline: 'Desempate por tiempo de espera acumulado',
    description: 'Dos incidencias con idéntica distancia y gravedad. La lógica difusa de Mamdani desempata penalizando fuertemente la espera prolongada (140 min vs 5 min).',
    brigades: [
      {
        id: 'B1',
        code: 'B-ALFA',
        name: 'Brigada Alfa 01',
        location: { x: 30, y: 50 },
        specialty: 'Redes y Energía',
        speedKmH: 45,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'B-BETA',
        name: 'Brigada Beta 02',
        location: { x: 70, y: 50 },
        specialty: 'Rescate e Incendios',
        speedKmH: 45,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-CRON',
        title: 'Falla Eléctrica Demorada (140 min)',
        sector: 'Sector Oeste',
        location: { x: 30, y: 30 },
        severity: 6.0,
        impact: 6.0,
        waitTime: 140, // Prolonged
        mamdani: evaluateMamdani({ severity: 6.0, impact: 6.0, waitTime: 140 }),
      },
      {
        id: 'I2',
        code: 'INC-REC',
        title: 'Falla Eléctrica Reciente (5 min)',
        sector: 'Sector Este',
        location: { x: 70, y: 30 },
        severity: 6.0,
        impact: 6.0,
        waitTime: 5, // Recent
        mamdani: evaluateMamdani({ severity: 6.0, impact: 6.0, waitTime: 5 }),
      },
    ],
  },
]
