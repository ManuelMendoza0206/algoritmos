import React from 'react'
import { Flame, Clock, Sliders, Plus, Trash2, Truck } from 'lucide-react'
import type { Incident, Brigade } from '../../types/dispatch.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface IncidentEditorProps {
  incidents: Incident[]
  brigades: Brigade[]
  selectedIncidentId: string | null
  onSelectIncident: (id: string) => void
  onUpdateIncidentInputs: (id: string, inputs: { severity: number; impact: number; waitTime: number }) => void
  onAddIncident: () => void
  onDeleteIncident: (id: string) => void
}

export const IncidentEditor: React.FC<IncidentEditorProps> = ({
  incidents,
  brigades,
  selectedIncidentId,
  onSelectIncident,
  onUpdateIncidentInputs,
  onAddIncident,
  onDeleteIncident,
}) => {
  const selected = incidents.find((i) => i.id === selectedIncidentId) || incidents[0]

  if (!selected) {
    return (
      <div className="p-4 bg-[#0d121c] rounded-xl border border-[#1e2638] text-center text-slate-400 text-xs">
        No hay incidencias registradas.
        <button
          onClick={onAddIncident}
          className="mt-2 flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
        >
          <Plus className="w-4 h-4" /> Crear Incidencia
        </button>
      </div>
    )
  }

  const pStyle = getPriorityStyle(selected.mamdani.level)

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Active Incidents Selector Bar */}
      <div className="bg-[#0d121c] p-3 rounded-xl border border-[#1e2638]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Incidencias Activas ({incidents.length})
          </span>
          <button
            onClick={onAddIncident}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-medium transition-all"
          >
            <Plus className="w-3 h-3" /> Nueva
          </button>
        </div>

        {/* List of Incident Buttons */}
        <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {incidents.map((inc) => {
            const isCurrent = inc.id === selected.id
            const style = getPriorityStyle(inc.mamdani.level)
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                  isCurrent
                    ? 'bg-[#151d2d] border-cyan-500/50 shadow-sm'
                    : 'bg-[#0f1422] border-[#182133] hover:border-slate-600 hover:bg-[#121827]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: style.fillColor }}
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{inc.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inc.code} • {inc.sector}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border"
                    style={{
                      backgroundColor: `${style.fillColor}18`,
                      borderColor: `${style.fillColor}40`,
                      color: style.fillColor,
                    }}
                  >
                    {inc.mamdani.score}
                  </span>
                  {incidents.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteIncident(inc.id)
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
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

      {/* Real-time Mamdani Sliders for the Selected Incident */}
      <div className="bg-[#0d121c] p-3.5 rounded-xl border border-[#1e2638] flex flex-col gap-3.5">
        {/* Card Header with Live Score Banner */}
        <div className="flex items-start justify-between border-b border-[#182133] pb-2.5">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Ajuste de Parámetros Difusos
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">{selected.title}</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Ubicación: ({selected.location.x}, {selected.location.y}) • {selected.sector}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Puntaje Mamdani</span>
            <span
              className="text-base font-bold font-mono px-2 py-0.5 rounded border inline-block mt-0.5"
              style={{
                backgroundColor: `${pStyle.fillColor}20`,
                borderColor: `${pStyle.fillColor}50`,
                color: pStyle.fillColor,
              }}
            >
              {selected.mamdani.score}{' '}
              <span className="text-xs font-sans font-semibold">({selected.mamdani.level})</span>
            </span>
          </div>
        </div>

        {/* Slider 1: Gravedad del Fallo */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Gravedad del Fallo</span>
            </label>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {selected.severity.toFixed(1)} <span className="text-slate-500 text-[10px]">/ 10</span>
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
            className="w-full h-1.5 bg-[#1b2438] rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Baja)</span>
            <span>5 (Media)</span>
            <span>10 (Alta)</span>
          </div>
        </div>

        {/* Slider 2: Impacto Operativo */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Impacto Operativo</span>
            </label>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {selected.impact.toFixed(1)} <span className="text-slate-500 text-[10px]">/ 10</span>
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
            className="w-full h-1.5 bg-[#1b2438] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Leve)</span>
            <span>5 (Moderado)</span>
            <span>10 (Crítico)</span>
          </div>
        </div>

        {/* Slider 3: Tiempo de Espera */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tiempo de Espera Acumulado</span>
            </label>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {selected.waitTime} <span className="text-slate-500 text-[10px]">min</span>
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
            className="w-full h-1.5 bg-[#1b2438] rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 min (Reciente)</span>
            <span>60 min (Moderado)</span>
            <span>180 min (Prolongado)</span>
          </div>
        </div>

        {/* Fired Rules live feed */}
        <div className="border-t border-[#182133] pt-2.5">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Reglas Difusas Activas ({selected.mamdani.activeRules.length})
          </span>
          <div className="space-y-1 max-h-[105px] overflow-y-auto pr-1">
            {selected.mamdani.activeRules.slice(0, 4).map((rule) => (
              <div
                key={rule.id}
                className="p-1.5 rounded bg-[#090d16] border border-[#1a2335] text-[10px] font-mono flex items-center justify-between"
              >
                <span className="text-slate-300 truncate max-w-[70%]">
                  <span className="text-cyan-400 font-bold">{rule.id}:</span> {rule.description}
                </span>
                <span className="text-emerald-400 font-bold px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  α = {rule.firingStrength.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brigades Status List */}
      <div className="bg-[#0d121c] p-3 rounded-xl border border-[#1e2638]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            Flota de Brigadas ({brigades.length})
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Todas Operativas
          </span>
        </div>

        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
          {brigades.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-2 rounded bg-[#0f1422] border border-[#182133]"
            >
              <div>
                <span className="font-semibold text-slate-200 block">{b.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">{b.specialty}</span>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-300">{b.speedKmH} km/h</span>
                <span className="text-slate-500 block text-[9px]">({b.location.x}, {b.location.y})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
