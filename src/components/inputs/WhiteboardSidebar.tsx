import React from 'react'
import {
  Flame,
  Clock,
  Sliders,
  Plus,
  Trash2,
  Truck,
  AlertCircle,
  MapPin
} from 'lucide-react'
import type { Incident, Brigade } from '../../types/dispatch.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface WhiteboardSidebarProps {
  incidents: Incident[]
  brigades: Brigade[]
  selectedIncidentId: string | null
  onSelectIncident: (id: string) => void
  onUpdateIncidentInputs: (id: string, inputs: { severity: number; impact: number; waitTime: number }) => void
  onUpdateIncidentTitle: (id: string, title: string) => void
  onAddIncident: () => void
  onDeleteIncident: (id: string) => void
  onAddBrigade: () => void
  onDeleteBrigade: (id: string) => void
}

export const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  incidents,
  brigades,
  selectedIncidentId,
  onSelectIncident,
  onUpdateIncidentInputs,
  onUpdateIncidentTitle,
  onAddIncident,
  onDeleteIncident,
  onAddBrigade,
  onDeleteBrigade,
}) => {
  const selected = incidents.find((i) => i.id === selectedIncidentId) || incidents[0]
  const pStyle = selected ? getPriorityStyle(selected.mamdani.level) : null

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Selected Incident Editor Card */}
      {selected && pStyle && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nombre de la Incidencia:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={selected.title}
                  onChange={(e) => onUpdateIncidentTitle(selected.id, e.target.value)}
                  placeholder="Ej: Incidencia 1"
                  className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                Coord: ({selected.location.x}, {selected.location.y}) • {selected.code}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium">Prioridad Mamdani</span>
              <span
                className="text-base font-bold font-mono px-2.5 py-0.5 rounded-lg border inline-block mt-0.5 shadow-xs"
                style={{
                  backgroundColor: pStyle.bg,
                  borderColor: pStyle.fillColor + '40',
                  color: pStyle.fillColor,
                }}
              >
                {selected.mamdani.score}{' '}
                <span className="text-xs font-sans font-semibold">({selected.mamdani.level})</span>
              </span>
            </div>
          </div>

          {/* Slider 1: Gravedad */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Gravedad del Fallo</span>
              </label>
              <span className="font-mono font-bold text-rose-600 text-sm">
                {selected.severity.toFixed(1)} <span className="text-slate-400 text-[10px]">/ 10</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={selected.severity}
              onChange={(e) =>
                onUpdateIncidentInputs(selected.id, {
                  severity: parseFloat(e.target.value),
                  impact: selected.impact,
                  waitTime: selected.waitTime,
                })
              }
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baja (0)</span>
              <span>Media (5)</span>
              <span>Alta (10)</span>
            </div>
          </div>

          {/* Slider 2: Impacto */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Impacto Operativo</span>
              </label>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {selected.impact.toFixed(1)} <span className="text-slate-400 text-[10px]">/ 10</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={selected.impact}
              onChange={(e) =>
                onUpdateIncidentInputs(selected.id, {
                  severity: selected.severity,
                  impact: parseFloat(e.target.value),
                  waitTime: selected.waitTime,
                })
              }
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Leve (0)</span>
              <span>Moderado (5)</span>
              <span>Crítico (10)</span>
            </div>
          </div>

          {/* Slider 3: Tiempo de Espera */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Tiempo de Espera Acumulado</span>
              </label>
              <span className="font-mono font-bold text-blue-600 text-sm">
                {selected.waitTime} <span className="text-slate-400 text-[10px]">min</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={selected.waitTime}
              onChange={(e) =>
                onUpdateIncidentInputs(selected.id, {
                  severity: selected.severity,
                  impact: selected.impact,
                  waitTime: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 min (Reciente)</span>
              <span>60 min (Moderado)</span>
              <span>180 min (Prolongado)</span>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Incidencias ({incidents.length})
          </span>
          <button
            onClick={onAddIncident}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>

        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
          {incidents.map((inc) => {
            const isCurrent = inc.id === selected?.id
            const style = getPriorityStyle(inc.mamdani.level)
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: style.fillColor }}
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{inc.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {inc.code} • ({inc.location.x}, {inc.location.y})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="font-mono font-bold text-xs px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: style.bg, color: style.fillColor }}
                  >
                    {inc.mamdani.score}
                  </span>
                  {incidents.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteIncident(inc.id)
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar incidencia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Brigades List Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-600" />
            Unidades de Rescate ({brigades.length})
          </span>
          <button
            onClick={onAddBrigade}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>

        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
          {brigades.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">{b.name}</span>
                  <span className="text-[10px] text-blue-600 font-medium">{b.speedKmH} km/h</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="text-slate-400 text-[10px]">({b.location.x}, {b.location.y})</span>
                </div>
                {brigades.length > 1 && (
                  <button
                    onClick={() => onDeleteBrigade(b.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Eliminar brigada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
