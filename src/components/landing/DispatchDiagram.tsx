import React, { useId } from 'react'
import type { Brigade, DispatchMode, DispatchOutcome, Incident, Point } from '../../types/dispatch.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface DispatchDiagramProps {
  brigades: Brigade[]
  incidents: Incident[]
  classic: DispatchOutcome
  smart: DispatchOutcome
  mode: DispatchMode
  onModeChange?: (mode: DispatchMode) => void
  showLegend?: boolean
  compact?: boolean
  label?: string
}

const project = (p: Point): Point => ({ x: 10 + p.x * 0.8, y: 10 + p.y * 0.8 })

const STROKE = {
  classic: '#0f172a',
  smartStop1: '#2563eb',
  smartStop2: '#d97706',
}

export const DispatchDiagram: React.FC<DispatchDiagramProps> = ({
  brigades,
  incidents,
  classic,
  smart,
  mode,
  onModeChange,
  showLegend = true,
  compact = false,
  label = 'Plano operativo · 25 km',
}) => {
  const uid = useId().replace(/[:]/g, '')
  const activeOutcome = mode === 'classic' ? classic : smart
  const interactive = Boolean(onModeChange)

  const renderRoutes = (outcome: DispatchOutcome, visible: boolean, key: string) => (
    <g
      key={key}
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      {outcome.assignments.map((a, index) => {
        const from = project(a.fromLocation)
        const to = project(a.incident.location)
        const isStop1 = a.stopOrder === 1
        const color =
          mode === 'classic'
            ? STROKE.classic
            : isStop1
            ? STROKE.smartStop1
            : STROKE.smartStop2
        const markerKey = mode === 'classic' ? 'classic' : isStop1 ? 'stop1' : 'stop2'

        return (
          <g key={`${a.brigadeId}-${a.incidentId}-${index}`}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={2.4}
              strokeOpacity={0.14}
              strokeLinecap="round"
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={0.7}
              strokeLinecap="round"
              strokeDasharray="2.4 1.6"
              markerEnd={`url(#arrow-${uid}-${markerKey})`}
              className="route-flow"
              style={{ animationDelay: `${index * 140}ms` }}
            />
          </g>
        )
      })}
    </g>
  )

  return (
    <figure className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <span className="landing-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>

        {interactive ? (
          <div
            role="group"
            aria-label="Modo de asignación"
            className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => onModeChange?.('classic')}
              aria-pressed={mode === 'classic'}
              className={`landing-mono rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                mode === 'classic'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solo distancia
            </button>
            <button
              type="button"
              onClick={() => onModeChange?.('smart')}
              aria-pressed={mode === 'smart'}
              className={`landing-mono rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                mode === 'smart'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mamdani + Húngaro
            </button>
          </div>
        ) : (
          <span className="landing-mono rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800">
            Mamdani + Húngaro
          </span>
        )}
      </div>

      <div className={`relative blueprint-grid ${compact ? 'p-2' : 'p-3 sm:p-4'}`}>
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Plano de despacho en modo ${mode === 'classic' ? 'solo distancia' : 'inteligente'}`}
          className="block w-full h-auto"
        >
          <defs>
            {[
              { key: 'classic', color: STROKE.classic },
              { key: 'stop1', color: STROKE.smartStop1 },
              { key: 'stop2', color: STROKE.smartStop2 },
            ].map((m) => (
              <marker
                key={m.key}
                id={`arrow-${uid}-${m.key}`}
                viewBox="0 0 6 6"
                refX="5"
                refY="3"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 6 3 L 0 6 z" fill={m.color} />
              </marker>
            ))}
          </defs>

          {/* Grid + frame */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#cbd5e1" strokeWidth="0.35" />
          {[20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <g key={v} stroke="#e2e8f0" strokeWidth="0.2">
              <line x1={v} y1="10" x2={v} y2="90" />
              <line x1="10" y1={v} x2="90" y2={v} />
            </g>
          ))}

          {/* North marker */}
          <g transform="translate(86,14)" fill="#94a3b8">
            <path d="M 0 -2.6 L 1.4 1.8 L 0 0.9 L -1.4 1.8 Z" />
            <text x="0" y="-3.6" textAnchor="middle" fontSize="2.4" className="landing-mono">
              N
            </text>
          </g>

          {renderRoutes(classic, mode === 'classic', 'classic')}
          {renderRoutes(smart, mode === 'smart', 'smart')}

          {/* Brigades */}
          {brigades.map((b) => {
            const p = project(b.location)
            return (
              <g key={b.id} transform={`translate(${p.x},${p.y})`}>
                <path
                  d="M 0 -2.9 L 2.9 0 L 0 2.9 L -2.9 0 Z"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
                <text
                  x="-4.2"
                  y="1"
                  textAnchor="end"
                  fontSize="2.5"
                  fontWeight="600"
                  fill="#1e3a8a"
                  className="landing-mono"
                >
                  {b.code}
                </text>
              </g>
            )
          })}

          {/* Incidents */}
          {incidents.map((inc) => {
            const p = project(inc.location)
            const style = getPriorityStyle(inc.mamdani.level)
            const labelSide = p.x < 50 ? 1 : -1
            return (
              <g key={inc.id} transform={`translate(${p.x},${p.y})`}>
                <circle r="4.4" fill={style.fillColor} fillOpacity="0.14" stroke={style.fillColor} strokeWidth="0.8" />
                <circle r="3.2" fill={style.fillColor} />
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fontSize="2.7"
                  fontWeight="600"
                  fill="#ffffff"
                  className="landing-mono"
                >
                  {Math.round(inc.mamdani.score)}
                </text>
                <text
                  x={labelSide * 5.4}
                  y="1.1"
                  textAnchor={labelSide === 1 ? 'start' : 'end'}
                  fontSize="2.3"
                  fill="#475569"
                  className="landing-mono"
                >
                  {inc.code}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {showLegend && (
        <figcaption className="border-t border-slate-200">
          <ul className="divide-y divide-slate-100">
            {incidents.map((inc) => {
              const assignment = activeOutcome.assignments.find((a) => a.incidentId === inc.id)
              const style = getPriorityStyle(inc.mamdani.level)
              return (
                <li key={inc.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: style.fillColor }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 text-xs font-medium leading-5 text-slate-800">
                      {inc.title}
                    </span>
                    <span className="landing-mono shrink-0 text-[10px] text-slate-500">
                      P {inc.mamdani.score}
                    </span>
                  </div>
                  <span className="landing-mono shrink-0 text-[11px] text-slate-700">
                    {assignment ? (
                      <>
                        {assignment.brigade.code}
                        <span className="text-slate-400"> · </span>
                        {assignment.stopOrder === 2 && (
                          <span className="text-amber-700">+{assignment.etaMinutes} min = </span>
                        )}
                        <strong className="font-semibold text-slate-900">
                          {assignment.cumulativeEtaMinutes} min
                        </strong>
                      </>
                    ) : (
                      <span className="text-rose-600">sin unidad</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </figcaption>
      )}
    </figure>
  )
}
