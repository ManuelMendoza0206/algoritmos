import React, { useState } from 'react'
import { CheckCircle2, ChevronRight, Calculator, Check, Info } from 'lucide-react'
import type { DispatchOutcome, Brigade, Incident } from '../../types/dispatch.ts'

interface HungarianInspectorProps {
  outcome: DispatchOutcome
  brigades: Brigade[]
  incidents: Incident[]
}

export const HungarianInspector: React.FC<HungarianInspectorProps> = ({
  outcome,
  brigades,
  incidents,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)

  const { costMatrix, distanceMatrix, hungarian, mode } = outcome
  const steps = hungarian.steps

  const isAssigned = (r: number, c: number) => {
    return hungarian.assignments.some(([ar, ac]) => ar === r && ac === c)
  }

  const currentStep = steps[activeStepIndex] || steps[0]
  const displayMatrix = currentStep ? currentStep.matrix : costMatrix

  const hoveredR = selectedCell ? selectedCell.r : (hungarian.assignments[0] ? hungarian.assignments[0][0] : 0)
  const hoveredC = selectedCell ? selectedCell.c : (hungarian.assignments[0] ? hungarian.assignments[0][1] : 0)
  const brig = brigades[hoveredR]
  const inc = incidents[hoveredC]
  const dist = distanceMatrix[hoveredR] ? distanceMatrix[hoveredR][hoveredC] : 0
  const cost = costMatrix[hoveredR] ? costMatrix[hoveredR][hoveredC] : 0

  return (
    <div className="flex flex-col gap-6 text-xs max-w-[1500px] mx-auto p-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Optimización Combinatoria Bipartita O(N³)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Matriz de Asignación y Algoritmo Húngaro (Kuhn-Munkres)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Modo Activo: <strong className="text-slate-800">{mode === 'smart' ? 'Inteligente (Mamdani + Húngaro)' : 'Clásico (Solo Distancia)'}</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Costo Total Mínimo Optimizado</span>
          <span className="text-xl font-bold font-mono px-3.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-0.5 shadow-xs">
            {hungarian.totalCost.toFixed(2)} pts
          </span>
        </div>
      </div>

      {/* Grid: Matrix (2 Cols) + Formula Breakdown (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Cost Matrix */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Matriz de Costos ({brigades.length} Brigadas × {incidents.length} Incidencias)
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Verde = Asignación Óptima Kuhn-Munkres
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-xs font-mono font-bold text-slate-500 uppercase bg-slate-50 border border-slate-200 text-left">
                      Brigada \ Incidencia
                    </th>
                    {incidents.map((i) => (
                      <th key={i.id} className="p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200">
                        <div className="font-bold">{i.code}</div>
                        <div className="text-[11px] text-blue-600 font-semibold">{i.mamdani.score} pts</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brigades.map((b, r) => (
                    <tr key={b.id}>
                      <td className="p-3 text-left font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200">
                        <div className="text-slate-900">{b.code}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{b.name}</div>
                      </td>
                      {incidents.map((_, c) => {
                        const val = displayMatrix[r] ? displayMatrix[r][c] : 0
                        const assigned = isAssigned(r, c)
                        const isHovered = hoveredR === r && hoveredC === c

                        return (
                          <td
                            key={c}
                            onClick={() => setSelectedCell({ r, c })}
                            className={`p-3 font-mono font-bold border transition-all cursor-pointer ${
                              assigned
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-inner'
                                : isHovered
                                ? 'bg-blue-50 text-blue-900 border-blue-400'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-sm">{val !== undefined ? val.toFixed(1) : '-'}</span>
                              {assigned && <Check className="w-4 h-4 text-emerald-700" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stepper for Algorithm Reductions */}
          {steps.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Pasos de Reducción Kuhn-Munkres:
              </span>
              <div className="flex flex-wrap gap-2">
                {steps.map((st, idx) => {
                  const isActive = idx === activeStepIndex
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`text-xs font-mono px-3 py-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Paso {idx + 1}: {st.name}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium italic">
                {currentStep.description}
              </p>
            </div>
          )}
        </div>

        {/* Right: Detailed Formula Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <ChevronRight className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-slate-900 text-sm">
                Desglose Analítico de Celda C[{hoveredR},{hoveredC}]
              </h5>
            </div>

            {brig && inc ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Emparejamiento Evaluado:</span>
                  <p className="text-slate-900 font-bold mt-0.5">{brig.name} ➔ {inc.title}</p>
                  <p className="text-blue-600 font-mono text-xs mt-0.5">{brig.code} asignado a {inc.code}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Distancia Euclidiana:</span>
                    <span className="text-slate-900 font-mono font-bold">{dist} km</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Velocidad de Unidad:</span>
                    <span className="text-slate-900 font-mono font-bold">{brig.speedKmH} km/h</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tiempo de Llegada (ETA):</span>
                    <span className="text-blue-600 font-mono font-bold">
                      {((dist / brig.speedKmH) * 60).toFixed(1)} min
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Prioridad Mamdani:</span>
                    <span className="text-rose-600 font-mono font-bold">{inc.mamdani.score} / 100</span>
                  </div>
                </div>

                {/* Formula Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    {mode === 'smart' ? 'Fórmula de Riesgo Acoplado:' : 'Fórmula Proximidad Pura:'}
                  </span>
                  {mode === 'smart' ? (
                    <div className="text-xs text-slate-600 leading-relaxed font-mono">
                      <div className="font-semibold text-slate-800">C[i,j] = ETA × (0.5 + 2.8 × P/100)</div>
                      <div className="mt-1 text-slate-500">
                        = {((dist / brig.speedKmH) * 60).toFixed(1)} × {(0.5 + 2.8 * (inc.mamdani.score / 100)).toFixed(2)}
                      </div>
                      <div className="mt-1.5 text-emerald-700 font-bold text-sm">
                        = {cost.toFixed(2)} pts de penalización
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed font-mono">
                      <div className="font-semibold text-slate-800">C[i,j] = Distancia (km)</div>
                      <div className="mt-1 text-amber-700 font-bold text-sm">
                        = {dist.toFixed(2)} km
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Status Pill */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isAssigned(hoveredR, hoveredC) ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isAssigned(hoveredR, hoveredC) ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {isAssigned(hoveredR, hoveredC)
                      ? 'Emparejamiento Seleccionado por Kuhn-Munkres'
                      : 'No seleccionado por el óptimo global'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Selecciona una celda de la matriz.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
