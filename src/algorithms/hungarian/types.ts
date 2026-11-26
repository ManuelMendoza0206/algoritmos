export interface AssignmentStep {
  name: string
  description: string
  matrix: number[][]
  coveredRows?: number[]
  coveredCols?: number[]
}

export interface HungarianResult {
  // Array of pairs [rowIndex, colIndex] representing the optimal assignment
  assignments: [number, number][]
  totalCost: number
  originalMatrix: number[][]
  steps: AssignmentStep[]
}
