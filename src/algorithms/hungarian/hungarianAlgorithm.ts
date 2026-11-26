import type { AssignmentStep, HungarianResult } from './types.ts'

/**
 * Deep clone 2D matrix
 */
function cloneMatrix(mat: number[][]): number[][] {
  return mat.map(row => [...row])
}

/**
 * Solves the linear sum assignment problem using the Hungarian (Kuhn-Munkres) algorithm.
 * Finds the minimum cost assignment between rows (e.g. brigades) and columns (e.g. incidents).
 */
export function solveHungarian(inputMatrix: number[][]): HungarianResult {
  if (!inputMatrix || inputMatrix.length === 0 || inputMatrix[0].length === 0) {
    return {
      assignments: [],
      totalCost: 0,
      originalMatrix: [],
      steps: [],
    }
  }

  const originalMatrix = cloneMatrix(inputMatrix)
  const steps: AssignmentStep[] = []
  const numRows = inputMatrix.length
  const numCols = inputMatrix[0].length
  const n = Math.max(numRows, numCols)

  // Step 0: Pad matrix with max values if rectangular
  const matrix: number[][] = Array.from({ length: n }, (_, r) => {
    return Array.from({ length: n }, (_, c) => {
      if (r < numRows && c < numCols) {
        return inputMatrix[r][c]
      }
      return 1e6 // dummy high cost
    })
  })

  steps.push({
    name: 'Matriz Inicial de Costos',
    description: `Matriz ${numRows}x${numCols} (balanceada a ${n}x${n})`,
    matrix: cloneMatrix(matrix),
  })

  // Step 1: Row Reduction
  for (let r = 0; r < n; r++) {
    let minVal = Infinity
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] < minVal) minVal = matrix[r][c]
    }
    if (minVal > 0 && minVal < 1e6) {
      for (let c = 0; c < n; c++) {
        matrix[r][c] -= minVal
      }
    }
  }

  steps.push({
    name: 'Reducción por Filas',
    description: 'Resta del valor mínimo de cada fila a todos sus elementos.',
    matrix: cloneMatrix(matrix),
  })

  // Step 2: Column Reduction
  for (let c = 0; c < n; c++) {
    let minVal = Infinity
    for (let r = 0; r < n; r++) {
      if (matrix[r][c] < minVal) minVal = matrix[r][c]
    }
    if (minVal > 0 && minVal < 1e6) {
      for (let r = 0; r < n; r++) {
        matrix[r][c] -= minVal
      }
    }
  }

  steps.push({
    name: 'Reducción por Columnas',
    description: 'Resta del valor mínimo de cada columna a todos sus elementos.',
    matrix: cloneMatrix(matrix),
  })

  // Kuhn-Munkres iterative augmentation
  // We maintain potentials u[r] and v[c], and matching p[c] = r (who is assigned to column c)
  const u = new Array(n + 1).fill(0)
  const v = new Array(n + 1).fill(0)
  const p = new Array(n + 1).fill(0)
  const way = new Array(n + 1).fill(0)

  // 1-indexed for the standard Kuhn-Munkres potential algorithm
  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(n + 1).fill(Infinity)
    const used = new Array(n + 1).fill(false)

    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0

      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = matrix[i0 - 1][j - 1] - u[i0] - v[j]
          if (cur < minv[j]) {
            minv[j] = cur
            way[j] = j0
          }
          if (minv[j] < delta) {
            delta = minv[j]
            j1 = j
          }
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta
          v[j] -= delta
        } else {
          minv[j] -= delta
        }
      }

      j0 = j1
    } while (p[j0] !== 0)

    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0 !== 0)
  }

  // Extract assignments: p[col] = row (1-indexed)
  const rawAssignments: [number, number][] = []
  let totalCost = 0

  for (let c = 1; c <= n; c++) {
    const r = p[c]
    if (r > 0 && r <= numRows && c <= numCols) {
      const rowIdx = r - 1
      const colIdx = c - 1
      const cost = originalMatrix[rowIdx][colIdx]
      rawAssignments.push([rowIdx, colIdx])
      totalCost += cost
    }
  }

  // Sort assignments by row index
  rawAssignments.sort((a, b) => a[0] - b[0])

  steps.push({
    name: 'Asignación Óptima Encontrada',
    description: `Coste total mínimo calculado: ${totalCost.toFixed(2)}`,
    matrix: cloneMatrix(matrix),
  })

  return {
    assignments: rawAssignments,
    totalCost: Number(totalCost.toFixed(2)),
    originalMatrix,
    steps,
  }
}
