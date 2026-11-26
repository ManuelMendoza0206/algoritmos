import React from 'react'
import type { Incident } from '../../types/dispatch.ts'
import { SEVERITY_SETS, IMPACT_SETS, WAIT_TIME_SETS } from '../../algorithms/fuzzy/mamdaniEngine.ts'
import { evaluateMembership } from '../../algorithms/fuzzy/membership.ts'
import type { FuzzySetDefinition } from '../../algorithms/fuzzy/types.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'
import { Sliders, Cpu, CheckCircle } from 'lucide-react'

interface MamdaniInspectorProps {
  incident: Incident
  allIncidents: Incident[]
  onSelectIncident: (id: string) => void
}

const LightFuzzyPlot: React.FC<{
  title: string
  currentValue: number
  domain: [number, number]
  sets: Record<string, FuzzySetDefinition>
  unit: string
  accentColor: string
}> = ({ title, currentValue, domain, sets, unit, accentColor }) => {
  const [min, max] = domain
  const width = 320
  const height = 95
  const padding = 20

  const scaleX = (val: number) => padding + ((val - min) / (max - min)) * (width - 2 * padding)
  const scaleY = (mu: number) => height - padding - mu * (height - 2 * padding)

  const setColors = ['#059669', '#d97706', '#e11d48', '#7c3aed']

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-800">{title}</span>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md" style={{ color: accentColor, backgroundColor: `${accentColor}12` }}>
          {currentValue.toFixed(1)} {unit}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        {/* Baseline & Peak Guide */}
        <line x1={padding} y1={scaleY(0)} x2={width - padding} y2={scaleY(0)} stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1={padding} y1={scaleY(1)} x2={width - padding} y2={scaleY(1)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

        {/* Membership Curves */}
        {Object.entries(sets).map(([name, setDef], idx) => {
          const color = setColors[idx % setColors.length]
          const points: string[] = []
          const steps = 60
          for (let i = 0; i <= steps; i++) {
            const xVal = min + (i / steps) * (max - min)
            const mu = evaluateMembership(xVal, setDef)
            points.push(`${scaleX(xVal)},${scaleY(mu)}`)
          }

          const currentMu = evaluateMembership(currentValue, setDef)

          return (
            <g key={name}>
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.85"
              />
              <text
                x={scaleX(setDef.type === 'triangular' ? setDef.params[1] : (setDef.params[1] + setDef.params[2]) / 2)}
                y={scaleY(0.96)}
                fill={color}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {name} {currentMu > 0.05 ? `(${currentMu.toFixed(2)})` : ''}
              </text>
            </g>
          )
        })}

        {/* Current Value Marker */}
        <line
          x1={scaleX(currentValue)}
          y1={padding - 5}
          x2={scaleX(currentValue)}
          y2={height - padding}
          stroke="#0f172a"
          strokeWidth="2"
          strokeDasharray="3,2"
        />
        <circle cx={scaleX(currentValue)} cy={scaleY(0)} r="3.5" fill="#0f172a" />
      </svg>
    </div>
  )
}

export const MamdaniInspector: React.FC<MamdaniInspectorProps> = ({
  incident,
  allIncidents,
  onSelectIncident,
}) => {
  const { mamdani } = incident
  const style = getPriorityStyle(mamdani.level)

  return (
    <div className="flex flex-col gap-6 text-xs max-w-[1500px] mx-auto p-4">
      {/* Top Selector Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Evaluación Difusa en Tiempo Real
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{incident.title}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Código: <strong className="text-slate-700">{incident.code}</strong> • Sector: {incident.sector}
            </p>
          </div>
        </div>

        {/* Incident Selector Pill Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Seleccionar Caso:</span>
          {allIncidents.map((inc) => {
            const isCur = inc.id === incident.id
            const s = getPriorityStyle(inc.mamdani.level)
            return (
              <button
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  isCur
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fillColor }} />
                <span>{inc.code}</span>
              </button>
            )
          })}
        </div>

        {/* Priority Badge */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Puntaje Mamdani</span>
          <span
            className="text-xl font-bold font-mono px-3.5 py-1 rounded-xl border inline-block mt-0.5 shadow-xs"
            style={{
              backgroundColor: style.bg,
              borderColor: style.fillColor + '40',
              color: style.fillColor,
            }}
          >
            {mamdani.score}{' '}
            <span className="text-xs font-sans font-semibold">({mamdani.level})</span>
          </span>
        </div>
      </div>

      {/* 3 Input Fuzzy Plots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LightFuzzyPlot
          title="Gravedad del Fallo"
          currentValue={incident.severity}
          domain={[0, 10]}
          sets={SEVERITY_SETS}
          unit="/ 10"
          accentColor="#e11d48"
        />
        <LightFuzzyPlot
          title="Impacto Operativo"
          currentValue={incident.impact}
          domain={[0, 10]}
          sets={IMPACT_SETS}
          unit="/ 10"
          accentColor="#d97706"
        />
        <LightFuzzyPlot
          title="Tiempo de Espera Acumulado"
          currentValue={incident.waitTime}
          domain={[0, 180]}
          sets={WAIT_TIME_SETS}
          unit="min"
          accentColor="#2563eb"
        />
      </div>

      {/* Centroid Defuzzification Surface */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Superficie de Pertenencia Agregada y Defuzzificación por Centroide (COA)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Unión S-norma Máximo de los consecuentes truncados por el corte alfa (T-norma Mínimo).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-400 inline-block" />
              Área Agregada
            </span>
            <span className="flex items-center gap-1.5 font-bold text-rose-600">
              <span className="w-3.5 h-1 bg-rose-500 inline-block" />
              Centroide y* = {mamdani.score}
            </span>
          </div>
        </div>

        {/* SVG Centroid Canvas */}
        <div className="w-full h-44 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <svg viewBox="0 0 500 120" className="w-full h-full" preserveAspectRatio="none">
            {/* Guide lines */}
            <line x1="25" y1="95" x2="475" y2="95" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="25" y1="20" x2="475" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

            {/* Shaded Area of Aggregation Curve */}
            {(() => {
              const points = mamdani.aggregationCurve.map((pt) => {
                const sx = 25 + (pt.x / 100) * 450
                const sy = 95 - pt.y * 75
                return `${sx},${sy}`
              })
              const polygonPoints = `25,95 ${points.join(' ')} 475,95`
              return (
                <polygon
                  points={polygonPoints}
                  fill="rgba(59, 130, 246, 0.18)"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              )
            })()}

            {/* Centroid Vertical Line y* */}
            {(() => {
              const cx = 25 + (mamdani.score / 100) * 450
              return (
                <g>
                  <line
                    x1={cx}
                    y1="10"
                    x2={cx}
                    y2="95"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeDasharray="4,2"
                  />
                  <circle cx={cx} cy="10" r="4.5" fill="#e11d48" />
                  <text x={cx} y="6" fill="#e11d48" fontSize="10" fontWeight="bold" textAnchor="middle">
                    y* = {mamdani.score}
                  </text>
                </g>
              )
            })()}

            {/* Axis Marks */}
            <text x="25" y="112" fill="#64748b" fontSize="9" fontWeight="bold">0 (Baja)</text>
            <text x="175" y="112" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">35 (Media)</text>
            <text x="325" y="112" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">70 (Alta)</text>
            <text x="475" y="112" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">100 (Crítica)</text>
          </svg>
        </div>

        {/* Fired Rules Table */}
        <div className="border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-800 block mb-2">
            Reglas Difusas Activadas para esta Incidencia ({mamdani.activeRules.length}):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {mamdani.activeRules.map((rule) => (
              <div
                key={rule.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="truncate mr-3">
                  <span className="font-bold text-blue-700 font-mono">{rule.id}: </span>
                  <span className="text-slate-700 font-mono text-[11px]">{rule.description}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold shrink-0">
                  α = {rule.firingStrength.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
