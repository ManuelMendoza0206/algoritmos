import React from 'react'
import {
  BarChart3,
  ShieldAlert,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Compass
} from 'lucide-react'
import type { Brigade, Incident, DispatchOutcome } from '../../types/dispatch.ts'
import { runDispatchEngine } from '../../algorithms/dispatch/dispatchEngine.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface ComparisonViewProps {
  brigades: Brigade[]
  incidents: Incident[]
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ brigades, incidents }) => {
  // Compute both outcomes simultaneously
  const classic = runDispatchEngine(brigades, incidents, 'classic')
  const smart = runDispatchEngine(brigades, incidents, 'smart')

  return (
    <div className="flex flex-col gap-6 text-xs max-w-[1500px] mx-auto p-4">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Evaluación Comparativa de Algoritmos
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Modo Clásico (Solo Distancia) vs Modo Inteligente (Mamdani + Húngaro)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Contraste de decisiones operativas, tiempos de respuesta a emergencias críticas y costo global.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Modo Clásico */}
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Modo Clásico: Heurística Voraz
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Minimización de Distancia Pura</h4>
              </div>
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Asigna las unidades más cercanas al evento más próximo geográficamente, ignorando la gravedad de los pacientes o el impacto en la infraestructura crítica.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">ETA Promedio</span>
                <span className="text-base font-bold font-mono text-slate-800">{classic.kpis.avgEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Cobertura Crítica</span>
                <span className="text-base font-bold font-mono text-amber-700">{classic.kpis.criticalCoveragePercent}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Distancia Flota</span>
                <span className="text-base font-bold font-mono text-slate-800">{classic.kpis.totalDistanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Despachos Resultantes:
            </span>
            {classic.assignments.map((a, i) => {
              const p = getPriorityStyle(a.incident.mamdani.level)
              return (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-bold text-slate-800">{a.brigade.name}</span>
                    <span className="text-slate-400 mx-1.5">➔</span>
                    <span className="font-semibold text-slate-700">{a.incident.title}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="font-bold text-amber-700">{a.etaMinutes} min</span>
                    <span className="text-slate-400 text-[10px] ml-1">({a.distanceKm} km)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 2: Modo Inteligente */}
        <div className="bg-white p-5 rounded-2xl border-2 border-blue-400 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Modo Inteligente: Mamdani + Húngaro
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Optimización Multi-Objetivo con Riesgo</h4>
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Mamdani evalúa el riesgo y urgencia clínica; el algoritmo Húngaro resuelve la asignación global de costo mínimo acoplando distancia y tiempo de respuesta para salvar vidas.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-700 block font-semibold">ETA Promedio</span>
                <span className="text-base font-bold font-mono text-blue-900">{smart.kpis.avgEtaMinutes} min</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block font-semibold">Cobertura Crítica</span>
                <span className="text-base font-bold font-mono text-emerald-800">{smart.kpis.criticalCoveragePercent}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Distancia Flota</span>
                <span className="text-base font-bold font-mono text-slate-800">{smart.kpis.totalDistanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Despachos Resultantes:
            </span>
            {smart.assignments.map((a, i) => {
              const p = getPriorityStyle(a.incident.mamdani.level)
              return (
                <div key={i} className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-bold text-slate-900">{a.brigade.name}</span>
                    <span className="text-blue-500 mx-1.5">➔</span>
                    <span className="font-semibold text-slate-800">{a.incident.title}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs">
                    <span className="font-bold text-blue-700">{a.etaMinutes} min</span>
                    <span
                      className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded font-bold"
                      style={{ backgroundColor: p.bg, color: p.fillColor }}
                    >
                      Prio {a.incident.mamdani.score}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Difference / Impact Summary Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-2">
          ¿Por qué este cambio es fundamental en tu defensa técnica en clase?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          En problemas de optimización operativa, <strong>el algoritmo por proximidad simple comete errores fatales</strong> cuando las demandas difieren en severidad. Al integrar el motor <strong>Mamdani</strong> para transformar variables continuas (Gravedad, Impacto, Espera) en un escalar de riesgo, y luego resolver el emparejamiento con el <strong>Algoritmo Húngaro (Kuhn-Munkres)</strong>, el sistema garantiza la distribución óptima global sin decisiones miopes.
        </p>
      </div>
    </div>
  )
}
