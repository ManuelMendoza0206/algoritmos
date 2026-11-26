import React, { useRef } from 'react'
import { Truck, AlertTriangle, Crosshair, Navigation } from 'lucide-react'
import type { Brigade, Incident, DispatchOutcome, Point } from '../../types/dispatch.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

interface TacticalMapProps {
  brigades: Brigade[]
  incidents: Incident[]
  outcome: DispatchOutcome
  selectedIncidentId: string | null
  onSelectIncident: (id: string) => void
  onMapClickToMoveIncident?: (coords: Point) => void
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  brigades,
  incidents,
  outcome,
  selectedIncidentId,
  onSelectIncident,
  onMapClickToMoveIncident,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClickToMoveIncident || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    const boundedX = Math.max(5, Math.min(95, x))
    const boundedY = Math.max(5, Math.min(95, y))
    onMapClickToMoveIncident({ x: boundedX, y: boundedY })
  }

  return (
    <div className="relative w-full h-[580px] bg-[#070a10] rounded-xl border border-[#1e2638] overflow-hidden select-none shadow-2xl flex flex-col">
      {/* Tactical Map Header Bar */}
      <div className="px-4 py-2.5 bg-[#0d121c] border-b border-[#182133] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Plano Táctico Metropolitano
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-[#141a29] px-2 py-0.5 rounded border border-[#1e283d]">
            Escala: 25 km²
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#06b6d4]" />
            <span>Brigadas ({brigades.length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-[0_0_8px_#f43f5e]" />
            <span>Incidencias ({incidents.length})</span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            Clic en el mapa para reposicionar incidencia seleccionada
          </span>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-crosshair">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onClick={handleSvgClick}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="tactical-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#161f31" strokeWidth="0.4" />
            </pattern>
            {/* Fine Grid Pattern */}
            <pattern id="fine-grid" width="2" height="2" patternUnits="userSpaceOnUse">
              <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#0e1522" strokeWidth="0.2" />
            </pattern>
          </defs>

          {/* Background Grid layers */}
          <rect width="100" height="100" fill="url(#fine-grid)" />
          <rect width="100" height="100" fill="url(#tactical-grid)" />

          {/* Radar Circles */}
          <circle cx="50" cy="50" r="20" fill="none" stroke="#182338" strokeWidth="0.3" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#182338" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* Main Coordinates Axis */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e2c45" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e2c45" strokeWidth="0.3" />

          {/* Urban Sectors Overlay */}
          <text x="5" y="8" fill="#334155" fontSize="3" fontWeight="bold" letterSpacing="0.1em">
            SECTOR NORTE (DISTRITO MÉDICO)
          </text>
          <text x="55" y="8" fill="#334155" fontSize="3" fontWeight="bold" letterSpacing="0.1em">
            SECTOR NORESTE (AEROPUERTO / LOGÍSTICA)
          </text>
          <text x="5" y="96" fill="#334155" fontSize="3" fontWeight="bold" letterSpacing="0.1em">
            SECTOR SUROESTE (RESIDENCIAL)
          </text>
          <text x="55" y="96" fill="#334155" fontSize="3" fontWeight="bold" letterSpacing="0.1em">
            SECTOR INDUSTRIAL (SUBESTACIÓN ELÉCTRICA)
          </text>

          {/* Dispatch Assignment Vector Lines */}
          {outcome.assignments.map((assignment, index) => {
            const b = assignment.brigade.location
            const inc = assignment.incident.location
            const isSmart = outcome.mode === 'smart'
            const strokeColor = isSmart ? '#06b6d4' : '#f59e0b'

            return (
              <g key={`vector-${index}`} className="transition-all duration-300">
                {/* Glow background line */}
                <line
                  x1={b.x}
                  y1={b.y}
                  x2={inc.x}
                  y2={inc.y}
                  stroke={strokeColor}
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                />
                {/* Active dashed animated line */}
                <line
                  x1={b.x}
                  y1={b.y}
                  x2={inc.x}
                  y2={inc.y}
                  stroke={strokeColor}
                  strokeWidth="0.5"
                  strokeDasharray="2, 1.5"
                />
              </g>
            )
          })}
        </svg>

        {/* DOM Overlays for Vector Pills (Distance & ETA) */}
        {outcome.assignments.map((assignment, index) => {
          const b = assignment.brigade.location
          const inc = assignment.incident.location
          const midX = (b.x + inc.x) / 2
          const midY = (b.y + inc.y) / 2
          const isSmart = outcome.mode === 'smart'

          return (
            <div
              key={`pill-${index}`}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${midX}%`, top: `${midY}%` }}
            >
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold shadow-lg backdrop-blur flex items-center gap-1 border ${
                  isSmart
                    ? 'bg-[#081524]/90 text-cyan-300 border-cyan-500/50'
                    : 'bg-[#1e1507]/90 text-amber-300 border-amber-500/50'
                }`}
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>{assignment.etaMinutes} min</span>
                <span className="text-slate-400">({assignment.distanceKm} km)</span>
              </div>
            </div>
          )
        })}

        {/* Brigades Markers */}
        {brigades.map((brigade) => (
          <div
            key={brigade.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25 group"
            style={{ left: `${brigade.location.x}%`, top: `${brigade.location.y}%` }}
          >
            {/* Brigade Pin */}
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-[#0e1e33] border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center text-cyan-300 transition-transform hover:scale-110">
                <Truck className="w-4 h-4" />
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded bg-[#09111c]/90 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-200 whitespace-nowrap shadow-md">
                {brigade.code}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-[#0c121e] border border-[#22304d] p-2 rounded-md shadow-xl text-xs z-40 pointer-events-none min-w-[150px]">
                <span className="font-bold text-white">{brigade.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">{brigade.specialty}</span>
                <span className="text-[10px] text-slate-400">Velocidad: {brigade.speedKmH} km/h</span>
                <span className="text-[10px] text-slate-400">Coords: ({brigade.location.x}, {brigade.location.y})</span>
              </div>
            </div>
          </div>
        ))}

        {/* Incidents Markers */}
        {incidents.map((incident) => {
          const isSelected = incident.id === selectedIncidentId
          const style = getPriorityStyle(incident.mamdani.level)
          const isCritical = incident.mamdani.level === 'Crítica'

          return (
            <div
              key={incident.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectIncident(incident.id)
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer transition-transform ${
                isSelected ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{ left: `${incident.location.x}%`, top: `${incident.location.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                {/* Concentric pulsing ring for critical/high emergencies */}
                {isCritical && (
                  <div
                    className="absolute -inset-2 rounded-full border border-rose-500/60 animate-ping pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                )}

                {/* Incident Hexagonal Pin */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all shadow-lg ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070a10]' : ''
                  }`}
                  style={{
                    backgroundColor: '#131926',
                    borderColor: style.fillColor,
                    borderWidth: '2px',
                    boxShadow: `0 0 14px ${style.fillColor}55`,
                    color: style.fillColor,
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                {/* Badge with Score and Code */}
                <div className="mt-1 px-1.5 py-0.5 rounded bg-[#0b101a]/95 border border-[#1e2a40] text-[10px] font-mono font-bold flex items-center gap-1 shadow-md whitespace-nowrap">
                  <span className="text-slate-300">{incident.code}</span>
                  <span
                    className="font-bold px-1 rounded text-[9px]"
                    style={{ backgroundColor: `${style.fillColor}22`, color: style.fillColor }}
                  >
                    {incident.mamdani.score}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
