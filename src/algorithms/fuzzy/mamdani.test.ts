import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateMamdani, MAMDANI_RULES } from './mamdaniEngine.ts'

test('the knowledge base keeps 27 unique rules', () => {
  assert.equal(MAMDANI_RULES.length, 27)
  assert.equal(new Set(MAMDANI_RULES.map((r) => r.id)).size, 27)
})

test('scores always stay inside the universe of discourse', () => {
  const cases = [
    { severity: 0, impact: 0, waitTime: 0 },
    { severity: 10, impact: 10, waitTime: 180 },
    { severity: 5, impact: 5, waitTime: 60 },
    { severity: 3.3, impact: 7.1, waitTime: 119 },
  ]

  for (const inputs of cases) {
    const result = evaluateMamdani(inputs)
    assert.ok(result.score >= 0 && result.score <= 100, `score ${result.score} out of range`)
    assert.equal(result.aggregationCurve.length, 201)
  }
})

test('a critical hospital failure is classified as Crítica', () => {
  const result = evaluateMamdani({ severity: 9.8, impact: 9.9, waitTime: 70 })
  assert.equal(result.level, 'Crítica')
  assert.ok(result.score > 82)
  assert.ok(result.activeRules.length > 0)
  assert.ok(result.activeRules.every((r) => r.firingStrength > 0))
})

test('a trivial failure is classified as Baja', () => {
  const result = evaluateMamdani({ severity: 1.2, impact: 1, waitTime: 10 })
  assert.equal(result.level, 'Baja')
  assert.ok(result.score < 35)
})

test('higher severity never lowers the priority score', () => {
  const base = { impact: 6, waitTime: 45 }
  const low = evaluateMamdani({ ...base, severity: 2 }).score
  const mid = evaluateMamdani({ ...base, severity: 6 }).score
  const high = evaluateMamdani({ ...base, severity: 9.5 }).score

  assert.ok(mid >= low)
  assert.ok(high >= mid)
})
