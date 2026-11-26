import { solveHungarian } from './hungarianAlgorithm.ts'

// Benchmark 1: Classic 3x3 test
const matrix3x3 = [
  [15, 40, 45],
  [20, 60, 35],
  [20, 40, 25],
]

const result1 = solveHungarian(matrix3x3)
console.log('Result 3x3 Total Cost:', result1.totalCost)
console.log('Assignments:', result1.assignments)
// Expected optimal: (0,0)=15, (1,2)=35, (2,1)=40 => Total = 90 (or (0,1)=40, (1,0)=20, (2,2)=25 => Total = 85)
// Let's verify:
// (0,0)=15, (1,2)=35, (2,1)=40 -> 15+35+40 = 90
// (0,1)=40, (1,0)=20, (2,2)=25 -> 40+20+25 = 85 (optimal is 85!)

// Benchmark 2: 4x4 matrix
const matrix4x4 = [
  [9, 2, 7, 8],
  [6, 4, 3, 7],
  [5, 8, 1, 8],
  [7, 6, 9, 4],
]
const result2 = solveHungarian(matrix4x4)
console.log('Result 4x4 Total Cost:', result2.totalCost)
console.log('Assignments 4x4:', result2.assignments)
// Expected optimal: (0,1)=2, (1,0)=6, (2,2)=1, (3,3)=4 => 2 + 6 + 1 + 4 = 13!
