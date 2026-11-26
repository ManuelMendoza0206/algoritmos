import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  MousePointer2,
  PlusCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react'
import type { Brigade, Incident, DispatchOutcome, Point } from '../../types/dispatch.ts'
import { getPriorityStyle } from '../../utils/priorityStyles.ts'

export type WhiteboardTool = 'select' | 'add-incident' | 'add-brigade'

interface WhiteboardCanvasProps {
  brigades: Brigade[]
  incidents: Incident[]
  outcome: DispatchOutcome
  selectedIncidentId: string | null
  onSelectIncident: (id: string) => void
  onUpdateBrigadeLocation: (id: string, location: Point) => void
  onUpdateIncidentLocation: (id: string, location: Point) => void
  onAddIncidentAt: (location: Point) => void
  onAddBrigadeAt: (location: Point) => void
  onResetScenario: () => void
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  brigades,
  incidents,
  outcome,
  selectedIncidentId,
  onSelectIncident,
  onUpdateBrigadeLocation,
  onUpdateIncidentLocation,
  onAddIncidentAt,
  onAddBrigadeAt,
  onResetScenario,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<WhiteboardTool>('select')
  const [draggingEntity, setDraggingEntity] = useState<{
    type: 'brigade' | 'incident'
    id: string
  } | null>(null)

  // Calculate percentage coordinates from clientX, clientY
  const getCoordinatesFromEvent = useCallback((e: MouseEvent | React.MouseEvent): Point => {
    if (!containerRef.current) return { x: 50, y: 50 }
    const rect = containerRef.current.getBoundingClientRect()
    const rawX = ((e.clientX - rect.left) / rect.width) * 100
    const rawY = ((e.clientY - rect.top) / rect.height) * 100
    const boundedX = Math.round(Math.max(4, Math.min(96, rawX)))
    const boundedY = Math.round(Math.max(5, Math.min(95, rawY)))
    return { x: boundedX, y: boundedY }
  }, [])

  // Canvas Click Handler (for adding items when tool is selected)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingEntity) return
    const coords = getCoordinatesFromEvent(e)

    if (activeTool === 'add-incident') {
      onAddIncidentAt(coords)
      setActiveTool('select')
    } else if (activeTool === 'add-brigade') {
      onAddBrigadeAt(coords)
      setActiveTool('select')
    }
  }

  // Handle Drag Pointer Down
  const handleStartDrag = (
    e: React.PointerEvent,
    type: 'brigade' | 'incident',
    id: string
  ) => {
    e.stopPropagation()
    if (activeTool !== 'select') return
    setDraggingEntity({ type, id })
    if (type === 'incident') {
      onSelectIncident(id)
    }
  }

  // Global Pointer Move & Up listeners while dragging
  useEffect(() => {
    if (!draggingEntity) return

    const handlePointerMove = (e: PointerEvent) => {
      const coords = getCoordinatesFromEvent(e)
      if (draggingEntity.type === 'brigade') {
        onUpdateBrigadeLocation(draggingEntity.id, coords)
      } else {
        onUpdateIncidentLocation(draggingEntity.id, coords)
      }
    }

    const handlePointerUp = () => {
      setDraggingEntity(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggingEntity, getCoordinatesFromEvent, onUpdateBrigadeLocation, onUpdateIncidentLocation])

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-[640px] relative select-none">
      {/* Interactive Top Action Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white/95 backdrop-blur flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left: Tools Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTool('select')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTool === 'select'
                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Seleccionar y Arrastrar</span>
          </button>

          <button
            onClick={() => setActiveTool('add-incident')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTool === 'add-incident'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Colocar Incidencia</span>
          </button>

          <button
            onClick={() => setActiveTool('add-brigade')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTool === 'add-brigade'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Colocar Unidad</span>
          </button>
        </div>

        {/* Right: Quick actions & Instructions */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden md:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {activeTool === 'select'
              ? 'Arrastra cualquier unidad o incidencia libremente por la pizarra'
              : 'Haz clic en cualquier punto de la pizarra para colocar el elemento'}
          </span>

          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors font-medium"
            title="Restablecer posiciones iniciales del escenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Whiteboard Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className={`relative flex-1 w-full h-full whiteboard-dots overflow-hidden ${
          activeTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Subtle Watermark Sector Labels */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between text-[11px] font-bold text-slate-300 uppercase tracking-widest">
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> Distrito Norte / Médico</span>
            <span>Sector Noreste / Logística</span>
          </div>
          <div className="flex justify-between">
            <span>Sector Suroeste / Residencial</span>
            <span>Sector Industrial / Red Eléctrica</span>
          </div>
        </div>

        {/* SVG Vector Dispatch Lines Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {outcome.assignments.map((assignment, index) => {
            const b = assignment.brigade.location
            const inc = assignment.incident.location
            const isSmart = outcome.mode === 'smart'
            const strokeColor = isSmart ? '#2563eb' : '#d97706'

            return (
              <g key={`vector-${index}`}>
                {/* Thick subtle shadow line */}
                <line
                  x1={b.x}
                  y1={b.y}
                  x2={inc.x}
                  y2={inc.y}
                  stroke={strokeColor}
                  strokeWidth="0.8"
                  strokeOpacity="0.2"
                />
                {/* Sharp animated dispatch line */}
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

        {/* Floating ETA and Distance Badges on Vector Midpoints */}
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
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold shadow-md flex items-center gap-1.5 border ${
                  isSmart
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                    : 'bg-amber-600 text-white border-amber-500 shadow-amber-500/20'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{assignment.etaMinutes} min</span>
                <span className="opacity-80 text-[10px]">({assignment.distanceKm} km)</span>
              </div>
            </div>
          )
        })}

        {/* Draggable Brigade Pins */}
        {brigades.map((brigade) => {
          const isDragging = draggingEntity?.type === 'brigade' && draggingEntity?.id === brigade.id

          return (
            <div
              key={brigade.id}
              onPointerDown={(e) => handleStartDrag(e, 'brigade', brigade.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-25 transition-transform ${
                isDragging ? 'cursor-grabbing scale-110 shadow-2xl z-40' : 'cursor-grab hover:scale-105'
              }`}
              style={{ left: `${brigade.location.x}%`, top: `${brigade.location.y}%` }}
            >
              <div className="bg-white rounded-xl border-2 border-blue-600 shadow-md p-2 flex items-center gap-2 min-w-[130px]">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden leading-tight">
                  <p className="text-xs font-bold text-slate-800 truncate">{brigade.code}</p>
                  <p className="text-[10px] text-blue-600 font-medium truncate">{brigade.speedKmH} km/h</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Draggable Incident Pins */}
        {incidents.map((incident) => {
          const isSelected = incident.id === selectedIncidentId
          const isDragging = draggingEntity?.type === 'incident' && draggingEntity?.id === incident.id
          const style = getPriorityStyle(incident.mamdani.level)

          return (
            <div
              key={incident.id}
              onPointerDown={(e) => handleStartDrag(e, 'incident', incident.id)}
              onClick={(e) => {
                e.stopPropagation()
                onSelectIncident(incident.id)
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 transition-transform ${
                isDragging
                  ? 'cursor-grabbing scale-115 shadow-2xl z-40'
                  : 'cursor-grab hover:scale-105'
              }`}
              style={{ left: `${incident.location.x}%`, top: `${incident.location.y}%` }}
            >
              <div
                className={`bg-white rounded-xl border-2 shadow-md p-2 flex items-center gap-2 min-w-[145px] transition-all ${
                  isSelected ? 'ring-2 ring-slate-800 ring-offset-2' : ''
                }`}
                style={{ borderColor: style.fillColor }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold"
                  style={{ backgroundColor: style.fillColor }}
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="overflow-hidden leading-tight flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{incident.title}</p>
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="font-mono text-slate-500 font-semibold">{incident.code}</span>
                    <span
                      className="font-bold px-1 py-0.2 rounded"
                      style={{ backgroundColor: `${style.fillColor}18`, color: style.fillColor }}
                    >
                      {incident.mamdani.score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Unidades de Rescate: <strong className="text-slate-800 font-mono">{brigades.length}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Incidencias: <strong className="text-slate-800 font-mono">{incidents.length}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Emparejamientos Activos: <strong className="text-slate-800 font-mono">{outcome.assignments.length}</strong>
          </span>
        </div>

        <div className="text-slate-500 text-[11px] font-medium">
          Modo: <strong className="text-slate-800">{outcome.mode === 'smart' ? 'Inteligente (Mamdani + Húngaro)' : 'Clásico (Solo Distancia)'}</strong>
        </div>
      </div>
    </div>
  )
}
