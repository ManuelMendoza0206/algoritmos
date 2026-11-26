import test from 'node:test'
import assert from 'node:assert/strict'
import { solveHungarian } from './hungarianAlgorithm.ts'

function assertUniqueAssignment(assignments: [number, number][]) {
  const rows = new Set(assignments.map(([r]) => r))
  const cols = new Set(assignments.map(([, c]) => c))
  assert.equal(rows.size, assignments.length, 'each row is used once')
  assert.equal(cols.size, assignments.length, 'each column is used once')
}

test('solves a known 3x3 assignment to its minimum cost', () => {
  const result = solveHungarian([
    [15, 40, 45],
    [20, 60, 35],
    [20, 40, 25],
  ])

  assert.equal(result.totalCost, 85)
  assertUniqueAssignment(result.assignments)
})

test('solves a known 4x4 assignment to its minimum cost', () => {
  const result = solveHungarian([
    [9, 2, 7, 8],
    [6, 4, 3, 7],
    [5, 8, 1, 8],
    [7, 6, 9, 4],
  ])

  assert.equal(result.totalCost, 13)
  assertUniqueAssignment(result.assignments)
})

test('handles fewer rows than columns without reusing a column', () => {
  const result = solveHungarian([
    [4, 1, 3],
    [2, 0, 5],
  ])

  assert.equal(result.assignments.length, 2)
  assertUniqueAssignment(result.assignments)
  assert.equal(result.totalCost, 3)
})

test('records the reduction steps for the inspector', () => {
  const result = solveHungarian([[1, 2], [3, 4]])
  assert.ok(result.steps.length >= 3)
  assert.equal(result.steps[0].matrix.length, 2)
})

test('returns an empty result for an empty matrix', () => {
  const result = solveHungarian([])
  assert.deepEqual(result.assignments, [])
  assert.equal(result.totalCost, 0)
})
