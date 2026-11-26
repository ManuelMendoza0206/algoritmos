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
    tagline: 'Priorización estricta de emergencia sobre cercanía',
    description:
      'La Unidad 01 está a 1 km de una farola fundida y a 6,4 km de una falla de soporte vital en el hospital. El modo clásico la manda a la farola; el modo inteligente la manda al hospital.',
    brigades: [
      {
        id: 'B1',
        code: 'U-01',
        name: 'Unidad 01',
        location: { x: 20, y: 20 },
        specialty: 'Soporte Vital',
        speedKmH: 50,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'U-02',
        name: 'Unidad 02',
        location: { x: 85, y: 85 },
        specialty: 'Redes y Energía',
        speedKmH: 40,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-01',
        title: 'Hospital Central · Falla en UCI',
        sector: 'Distrito Médico',
        location: { x: 38, y: 38 },
        severity: 9.8,
        impact: 9.9,
        waitTime: 70,
        mamdani: evaluateMamdani({ severity: 9.8, impact: 9.9, waitTime: 70 }),
      },
      {
        id: 'I2',
        code: 'INC-02',
        title: 'Plaza Mayor · Farola fundida',
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
    name: 'Déficit de Unidades (2 Unidades vs 4 Incidencias)',
    tagline: 'Rutas secuenciales en dos paradas (Parada 1 ➔ Parada 2)',
    description:
      'Cuando hay más incidencias que brigadas, el sistema cubre primero las emergencias críticas (Parada 1) y programa la cola de atención secuencial (Parada 2) sobre las unidades que ya terminaron su primer servicio.',
    brigades: [
      {
        id: 'B1',
        code: 'U-01',
        name: 'Unidad 01',
        location: { x: 25, y: 35 },
        specialty: 'Soporte Vital',
        speedKmH: 50,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'U-02',
        name: 'Unidad 02',
        location: { x: 75, y: 65 },
        specialty: 'Redes y Energía',
        speedKmH: 45,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-01',
        title: 'Subestación · Fuga de aceite',
        sector: 'Sector Oeste',
        location: { x: 30, y: 40 },
        severity: 9.5,
        impact: 9.6,
        waitTime: 60,
        mamdani: evaluateMamdani({ severity: 9.5, impact: 9.6, waitTime: 60 }),
      },
      {
        id: 'I2',
        code: 'INC-02',
        title: 'Bodega · Incendio declarado',
        sector: 'Sector Este',
        location: { x: 80, y: 70 },
        severity: 9.0,
        impact: 9.2,
        waitTime: 45,
        mamdani: evaluateMamdani({ severity: 9.0, impact: 9.2, waitTime: 45 }),
      },
      {
        id: 'I3',
        code: 'INC-03',
        title: 'Semáforo caído · Cruce norte',
        sector: 'Sector Norte',
        location: { x: 40, y: 20 },
        severity: 4.0,
        impact: 4.5,
        waitTime: 30,
        mamdani: evaluateMamdani({ severity: 4.0, impact: 4.5, waitTime: 30 }),
      },
      {
        id: 'I4',
        code: 'INC-04',
        title: 'Filtración menor · Pasaje sur',
        sector: 'Sector Sur',
        location: { x: 70, y: 85 },
        severity: 2.0,
        impact: 2.2,
        waitTime: 15,
        mamdani: evaluateMamdani({ severity: 2.0, impact: 2.2, waitTime: 15 }),
      },
    ],
  },
  {
    id: 'empate-distancias',
    name: 'Empate de Distancias (Desempate por Espera)',
    tagline: 'La prioridad difusa rompe un empate geométrico',
    description:
      'La Unidad 01 está exactamente a la misma distancia de ambas incidencias, así que la cercanía no puede decidir. La lógica difusa la envía al caso con 140 min de espera y deja el fallo leve a la Unidad 02.',
    brigades: [
      {
        id: 'B1',
        code: 'U-01',
        name: 'Unidad 01',
        location: { x: 50, y: 50 },
        specialty: 'Rescate e Incendios',
        speedKmH: 45,
        status: 'available',
      },
      {
        id: 'B2',
        code: 'U-02',
        name: 'Unidad 02',
        location: { x: 20, y: 50 },
        specialty: 'Redes y Energía',
        speedKmH: 45,
        status: 'available',
      },
    ],
    incidents: [
      {
        id: 'I1',
        code: 'INC-01',
        title: 'Residencia · Ascensor bloqueado',
        sector: 'Sector Oeste',
        location: { x: 50, y: 20 },
        severity: 8.5,
        impact: 8.0,
        waitTime: 140,
        mamdani: evaluateMamdani({ severity: 8.5, impact: 8.0, waitTime: 140 }),
      },
      {
        id: 'I2',
        code: 'INC-02',
        title: 'Alumbrado público · Luminaria',
        sector: 'Sector Este',
        location: { x: 80, y: 50 },
        severity: 2.0,
        impact: 2.2,
        waitTime: 5,
        mamdani: evaluateMamdani({ severity: 2.0, impact: 2.2, waitTime: 5 }),
      },
    ],
  },
]
