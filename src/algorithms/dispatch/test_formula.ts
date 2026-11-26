import { solveHungarian } from '../hungarian/hungarianAlgorithm.ts'

const etaMatrix = [
  [3, 3] // B1 to [I_crit, I_triv]
]
const priorities = [92.4, 11.8]

const K = 0.8
const costMatrix = [
  [
    Number((etaMatrix[0][0] + K * (100 - priorities[0])).toFixed(2)), // 3 + 0.8 * 7.6 = 9.08
    Number((etaMatrix[0][1] + K * (100 - priorities[1])).toFixed(2)), // 3 + 0.8 * 88.2 = 73.56
  ]
]

console.log('Cost Matrix with (100 - Priority):', costMatrix)
const res = solveHungarian(costMatrix)
console.log('Hungarian Assignments:', res.assignments)
