import React from 'react'
import {
  Compass,
  Cpu,
  Calculator,
  BarChart3,
  BookOpen,
  Map,
  SlidersHorizontal,
  Flame,
  ShieldCheck
} from 'lucide-react'
import type { DispatchMode, DispatchOutcome } from '../../types/dispatch.ts'
import type { ScenarioPreset } from '../../data/presets.ts'

export type NavTab = 'whiteboard' | 'mamdani' | 'hungarian' | 'comparison'

interface NavbarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  presets: ScenarioPreset[]
  activePresetId: string
  onSelectPreset: (id: string) => void
  mode: DispatchMode
  onToggleMode: (mode: DispatchMode) => void
  outcome: DispatchOutcome
  onOpenMathModal: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  presets,
  activePresetId,
  onSelectPreset,
  mode,
  onToggleMode,
  outcome,
  onOpenMathModal,
}) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">FuzzyDispatch</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Pizarra Interactiva
              </span>
            </div>
            <p className="text-xs text-slate-500">Centro de Despacho • Mamdani + Kuhn-Munkres</p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200">
          <button
            onClick={() => onSelectTab('whiteboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'whiteboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4 text-blue-600" />
            <span>Pizarra</span>
          </button>

          <button
            onClick={() => onSelectTab('mamdani')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mamdani'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Motor Mamdani</span>
          </button>

          <button
            onClick={() => onSelectTab('hungarian')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hungarian'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Matriz Húngara</span>
          </button>

          <button
            onClick={() => onSelectTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Métricas & Comparativa</span>
          </button>
        </div>

        {/* Right: Mode Switch & Presets */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Escenario:</span>
            <select
              value={activePresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switch Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onToggleMode('classic')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'classic'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solo Distancia
            </button>
            <button
              onClick={() => onToggleMode('smart')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'smart'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mamdani + Húngaro
            </button>
          </div>

          {/* Math Explanation CTA */}
          <button
            onClick={onOpenMathModal}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Fundamentos</span>
          </button>
        </div>
      </div>

      {/* KPI Sub-strip (Clean & Crisp Light Mode) */}
      <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-2">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between text-xs gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tiempo Promedio ETA:</span>
              <span className="font-mono font-bold text-slate-900">
                {outcome.kpis.avgEtaMinutes} min
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cobertura Crítica:
              </span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {outcome.kpis.criticalCoveragePercent}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Costo Global (Húngaro):</span>
              <span className="font-mono font-bold text-blue-700">
                {outcome.kpis.globalCostIndex.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Distancia Total Flota:</span>
              <span className="font-mono font-bold text-slate-900">
                {outcome.kpis.totalDistanceKm} km
              </span>
            </div>
          </div>

          <div className="text-slate-500 italic text-[11px] font-medium hidden md:block">
            {mode === 'smart'
              ? '✓ Algoritmo prioriza gravedad clínica y tiempo de espera'
              : '⚠ Modo ciego: brigadas asignadas únicamente por cercanía física'}
          </div>
        </div>
      </div>
    </nav>
  )
}
