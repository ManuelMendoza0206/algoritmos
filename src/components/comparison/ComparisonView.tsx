import React from 'react'
import { BarChart3, CheckCircle, AlertTriangle } from 'lucide-react'
import type { Brigade, Incident } from '../../types/dispatch.ts'
import { runDispatchEngine } from '../../algorithms/dispatch/dispatchEngine.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface ComparisonViewProps {
  brigades: Brigade[]
  incidents: Incident[]
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ brigades, incidents }) => {
  const classic = runDispatchEngine(brigades, incidents, 'classic')
  const smart = runDispatchEngine(brigades, incidents, 'smart')
  const criticalDelta = Number(
    (classic.kpis.criticalEtaMinutes - smart.kpis.criticalEtaMinutes).toFixed(1)
  )

  return (
    <div className="flex flex-col gap-6 text-xs max-w-[1500px] mx-auto p-4">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evaluación comparativa de algoritmos
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Modo clásico (solo distancia) vs modo inteligente (Mamdani + Húngaro con rutas)
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Contraste de decisiones operativas, tiempo de llegada a emergencias críticas y despacho secuencial.
            </p>
          </div>
        </div>

        {criticalDelta !== 0 && (
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-medium">Ventaja en casos críticos</span>
            <span className="text-lg font-bold font-mono px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-0.5">
              {criticalDelta > 0 ? `−${criticalDelta} min` : `+${Math.abs(criticalDelta)} min`}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Modo Clásico */}
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Modo clásico: heurística voraz
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Minimización de distancia pura</h4>
              </div>
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Asigna las unidades únicamente por cercanía física. Una unidad con una farola a 1,4 km y un hospital a 6,4 km atiende primero la farola.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 block">Llegada media</span>
                <span className="text-base font-bold font-mono text-slate-800">{classic.kpis.avgEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 block">Llegada a críticas</span>
                <span className="text-base font-bold font-mono text-amber-700">{classic.kpis.criticalEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 block">Distancia flota</span>
                <span className="text-base font-bold font-mono text-slate-800">{classic.kpis.totalDistanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Despachos resultantes (Parada 1 y 2):
            </span>
            {classic.assignments.map((a, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="font-bold text-slate-800">{a.brigade.name}</span>
                  <span className="text-slate-400 mx-1.5">➔</span>
                  <span className="font-semibold text-slate-700">{a.incident.title}</span>
                </div>
                <div className="text-right shrink-0 font-mono text-xs flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {a.stopOrder === 1 ? 'Parada 1' : 'Parada 2'}
                  </span>
                  <span className="font-bold text-amber-700">
                    {a.stopOrder === 1 ? `${a.etaMinutes} min` : `${a.cumulativeEtaMinutes} min`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Modo Inteligente */}
        <div className="bg-white p-5 rounded-2xl border-2 border-blue-400 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Modo inteligente: Mamdani + Húngaro
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Costo ponderado por riesgo y rutas</h4>
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Mamdani calcula el riesgo y el costo multiplica el ETA por ese riesgo. El Húngaro acepta más kilómetros cuando el caso lo exige y planifica la Parada 2 para la cola remanente.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-800 block font-semibold">Llegada media</span>
                <span className="text-base font-bold font-mono text-blue-900">{smart.kpis.avgEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block font-semibold">Llegada a críticas</span>
                <span className="text-base font-bold font-mono text-emerald-800">{smart.kpis.criticalEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 block">Distancia flota</span>
                <span className="text-base font-bold font-mono text-slate-800">{smart.kpis.totalDistanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Despachos resultantes (Parada 1 y 2):
            </span>
            {smart.assignments.map((a, i) => {
              const p = getPriorityStyle(a.incident.mamdani.level)
              return (
                <div key={i} className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-900">{a.brigade.name}</span>
                    <span className="text-blue-500 mx-1.5">➔</span>
                    <span className="font-semibold text-slate-800">{a.incident.title}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        a.stopOrder === 1
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {a.stopOrder === 1 ? 'Parada 1' : 'Parada 2'}
                    </span>
                    <span className="font-bold text-blue-700">
                      {a.stopOrder === 1 ? `${a.etaMinutes} min` : `${a.cumulativeEtaMinutes} min`}
                    </span>
                    <span
                      className="text-[10px] ml-1 px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: p.bg, color: p.fillColor }}
                    >
                      {a.incident.mamdani.score}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
