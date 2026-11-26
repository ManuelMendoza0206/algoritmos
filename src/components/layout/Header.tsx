import React from 'react'
import { Activity, ShieldAlert, Cpu, BookOpen, Compass } from 'lucide-react'
import type { DispatchMode, DispatchOutcome } from '../../types/dispatch.ts'
import type { ScenarioPreset } from '../../data/presets.ts'

interface HeaderProps {
  presets: ScenarioPreset[]
  activePresetId: string
  onSelectPreset: (presetId: string) => void
  mode: DispatchMode
  onToggleMode: (newMode: DispatchMode) => void
  outcome: DispatchOutcome
  onOpenMathModal: () => void
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  mode,
  onToggleMode,
  outcome,
  onOpenMathModal,
}) => {
  return (
    <header className="border-b border-[#1e2638] bg-[#0c1019]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Bar: Title, Presets, Mode switch, Math CTA */}
      <div className="max-w-[1700px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                FuzzyDispatch <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">v2.0 Táctico</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span>Centro de Control de Despacho en Tiempo Real</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-emerald-400 font-mono">Mamdani FIS + Kuhn-Munkres</span>
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-[#111622] p-1 rounded-lg border border-[#1e2638]">
          <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Escenario:
          </span>
          {presets.map((p) => {
            const isActive = p.id === activePresetId
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
                }`}
                title={p.description}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        {/* Comparison Switch: Solo Distancia vs Mamdani + Húngaro */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#111622] p-1 rounded-lg border border-[#1e2638]">
            <button
              onClick={() => onToggleMode('classic')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                mode === 'classic'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <span>Modo Clásico</span>
              <span className="text-[10px] font-mono text-amber-400/80">(Solo distancia)</span>
            </button>
            <button
              onClick={() => onToggleMode('smart')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                mode === 'smart'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo Inteligente</span>
              <span className="text-[10px] font-mono text-cyan-400/80">(Mamdani + Húngaro)</span>
            </button>
          </div>

          {/* Math Explanation CTA */}
          <button
            onClick={onOpenMathModal}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium text-slate-300 bg-[#161d2c] hover:bg-[#1d273a] border border-[#222c42] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fundamentos Matemáticos</span>
          </button>
        </div>
      </div>

      {/* KPI Sub-bar */}
      <div className="bg-[#080b12] border-t border-[#182030] px-4 py-2">
        <div className="max-w-[1700px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* KPI 1: Tiempo Promedio de Respuesta */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#0f1420] border border-[#1a2335]">
            <span className="text-slate-400 font-medium">Tiempo Promedio ETA</span>
            <span className="font-mono font-semibold text-slate-200 flex items-center gap-1">
              <span className="text-cyan-400 text-sm">{outcome.kpis.avgEtaMinutes}</span> min
            </span>
          </div>

          {/* KPI 2: Cobertura de Emergencias Críticas */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#0f1420] border border-[#1a2335]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Cobertura Crítica
            </span>
            <span className={`font-mono font-semibold px-2 py-0.5 rounded text-xs ${
              outcome.kpis.criticalCoveragePercent === 100
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}>
              {outcome.kpis.criticalCoveragePercent}%
            </span>
          </div>

          {/* KPI 3: Costo Global Optimizado */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#0f1420] border border-[#1a2335]">
            <span className="text-slate-400 font-medium">Costo Global (Húngaro)</span>
            <span className="font-mono font-semibold text-amber-300 text-sm">
              {outcome.kpis.globalCostIndex.toFixed(1)}
            </span>
          </div>

          {/* KPI 4: Distancia Total Desplegada */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#0f1420] border border-[#1a2335]">
            <span className="text-slate-400 font-medium">Distancia Flota</span>
            <span className="font-mono font-semibold text-slate-300">
              {outcome.kpis.totalDistanceKm} km
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
