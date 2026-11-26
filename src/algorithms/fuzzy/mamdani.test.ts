import { evaluateMamdani } from './mamdaniEngine.ts'

const testCases = [
  { name: 'Emergencia Trivial', inputs: { severity: 1, impact: 1, waitTime: 5 } },
  { name: 'Emergencia Media', inputs: { severity: 5, impact: 5, waitTime: 60 } },
  { name: 'Emergencia Crítica Hospital', inputs: { severity: 9.8, impact: 9.5, waitTime: 120 } },
  { name: 'Empate de Distancia / Espera Alta', inputs: { severity: 4, impact: 4, waitTime: 140 } },
]

for (const tc of testCases) {
  const res = evaluateMamdani(tc.inputs)
  console.log(`[${tc.name}] Score: ${res.score} (${res.level}) | Active Rules: ${res.activeRules.length}`)
  res.activeRules.slice(0, 2).forEach(r => console.log(`  -> ${r.description}`))
}
