import { useState, useMemo, useCallback } from 'react'
import { Navbar, type NavTab } from './components/layout/Navbar.tsx'
import { LandingPage } from './components/landing/LandingPage.tsx'
import { WhiteboardCanvas } from './components/map/WhiteboardCanvas.tsx'
import { WhiteboardSidebar } from './components/inputs/WhiteboardSidebar.tsx'
import { MamdaniInspector } from './components/inspector/MamdaniInspector.tsx'
import { HungarianInspector } from './components/inspector/HungarianInspector.tsx'
import { ComparisonView } from './components/comparison/ComparisonView.tsx'
import { MathModal } from './components/modal/MathModal.tsx'
import { PRESET_SCENARIOS } from './data/presets.ts'
import { evaluateMamdani } from './algorithms/fuzzy/mamdaniEngine.ts'
import { runDispatchEngine } from './algorithms/dispatch/dispatchEngine.ts'
import type { DispatchMode, Incident, Brigade, Point } from './types/dispatch.ts'
import { Info, Sparkles, X } from 'lucide-react'

/** Next free numeric suffix for ids like I3 / B7, so deletion never causes collisions. */
function nextSequence(ids: string[]): number {
  return (
    ids.reduce((max, id) => {
      const match = id.match(/(\d+)$/)
      return match ? Math.max(max, Number(match[1])) : max
    }, 0) + 1
  )
}

export function App() {  const [activeTab, setActiveTab] = useState<NavTab>('landing')
  const [activePresetId, setActivePresetId] = useState<string>('falla-critica')
  const [mode, setMode] = useState<DispatchMode>('smart')
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false)
  const [showGuides, setShowGuides] = useState<boolean>(true)

  // Current Preset Initial Data
  const currentPreset = useMemo(() => {
    return PRESET_SCENARIOS.find((p) => p.id === activePresetId) || PRESET_SCENARIOS[0]
  }, [activePresetId])

  // Board State
  const [brigades, setBrigades] = useState<Brigade[]>(currentPreset.brigades)
  const [incidents, setIncidents] = useState<Incident[]>(currentPreset.incidents)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    currentPreset.incidents[0]?.id || ''
  )

  // Handle Preset Selection
  const handleSelectPreset = useCallback((presetId: string) => {
    setActivePresetId(presetId)
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId)
    if (preset) {
      setBrigades(preset.brigades)
      setIncidents(preset.incidents)
      setSelectedIncidentId(preset.incidents[0]?.id || '')
    }
  }, [])

  // Handle Resetting Board to Preset Defaults
  const handleResetScenario = useCallback(() => {
    setBrigades(currentPreset.brigades)
    setIncidents(currentPreset.incidents)
    setSelectedIncidentId(currentPreset.incidents[0]?.id || '')
  }, [currentPreset])

  // Handle Real-Time Slider Updates for Incident
  const handleUpdateIncidentInputs = useCallback(
    (id: string, inputs: { severity: number; impact: number; waitTime: number }) => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === id) {
            const updatedMamdani = evaluateMamdani(inputs)
            return {
              ...inc,
              severity: inputs.severity,
              impact: inputs.impact,
              waitTime: inputs.waitTime,
              mamdani: updatedMamdani,
            }
          }
          return inc
        })
      )
    },
    []
  )

  // Handle Custom Incident Title Update
  const handleUpdateIncidentTitle = useCallback((id: string, title: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, title } : inc))
    )
  }, [])

  // Handle Dragging Brigade
  const handleUpdateBrigadeLocation = useCallback((id: string, location: Point) => {
    setBrigades((prev) =>
      prev.map((b) => (b.id === id ? { ...b, location } : b))
    )
  }, [])

  // Handle Dragging Incident
  const handleUpdateIncidentLocation = useCallback((id: string, location: Point) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, location } : inc))
    )
  }, [])

  // Handle Adding Incident on Whiteboard Click
  const handleAddIncidentAt = useCallback(
    (location: Point) => {
      const n = nextSequence(incidents.map((i) => i.id))
      const code = `INC-${String(n).padStart(2, '0')}`
      const defaultInputs = { severity: 6.5, impact: 6.0, waitTime: 45 }
      const newInc: Incident = {
        id: `I${n}`,
        code,
        title: `Incidencia ${n}`,
        sector: 'Zona Urbana Central',
        location,
        severity: defaultInputs.severity,
        impact: defaultInputs.impact,
        waitTime: defaultInputs.waitTime,
        mamdani: evaluateMamdani(defaultInputs),
      }

      setIncidents((prev) => [...prev, newInc])
      setSelectedIncidentId(newInc.id)
    },
    [incidents]
  )

  // Handle Adding Brigade on Whiteboard Click
  const handleAddBrigadeAt = useCallback(
    (location: Point) => {
      const n = nextSequence(brigades.map((b) => b.id))
      const label = String(n).padStart(2, '0')
      const newBrigade: Brigade = {
        id: `B${n}`,
        code: `U-${label}`,
        name: `Unidad ${label}`,
        location,
        specialty: 'Soporte Vital',
        speedKmH: 48,
        status: 'available',
      }
      setBrigades((prev) => [...prev, newBrigade])
    },
    [brigades]
  )

  // Handle Quick Add Incident from Sidebar
  const handleAddIncident = useCallback(() => {
    handleAddIncidentAt({
      x: Math.round(30 + Math.random() * 40),
      y: Math.round(30 + Math.random() * 40),
    })
  }, [handleAddIncidentAt])

  // Handle Quick Add Brigade from Sidebar
  const handleAddBrigade = useCallback(() => {
    handleAddBrigadeAt({
      x: Math.round(20 + Math.random() * 60),
      y: Math.round(20 + Math.random() * 60),
    })
  }, [handleAddBrigadeAt])

  // Handle Deleting Incident
  const handleDeleteIncident = useCallback(
    (id: string) => {
      setIncidents((prev) => {
        const remaining = prev.filter((i) => i.id !== id)
        if (selectedIncidentId === id && remaining.length > 0) {
          setSelectedIncidentId(remaining[0].id)
        }
        return remaining
      })
    },
    [selectedIncidentId]
  )

  // Handle Deleting Brigade
  const handleDeleteBrigade = useCallback((id: string) => {
    setBrigades((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // Run Dispatch Engine Reactively (<1ms in client TypeScript)
  const dispatchOutcome = useMemo(() => {
    return runDispatchEngine(brigades, incidents, mode)
  }, [brigades, incidents, mode])

  const selectedIncident = useMemo(() => {
    return incidents.find((i) => i.id === selectedIncidentId) || incidents[0]
  }, [incidents, selectedIncidentId])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Clean Light Navbar with Navigation Tabs */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        presets={PRESET_SCENARIOS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        mode={mode}
        onToggleMode={setMode}
        outcome={dispatchOutcome}
        onOpenMathModal={() => setIsMathModalOpen(true)}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides((prev) => !prev)}
      />

      {/* Main Surface View Container */}
      <main className="flex-1 w-full">
        {/* Landing Page View */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartSimulation={() => setActiveTab('whiteboard')}
            onOpenMath={() => setIsMathModalOpen(true)}
          />
        )}

        {activeTab !== 'landing' && (
        <div className="max-w-[1700px] w-full mx-auto p-4 sm:p-6">
        {/* Whiteboard Interactive View */}
        {activeTab === 'whiteboard' && (
          <div className="flex flex-col gap-4">
            {/* Context Guide Callout Banner */}
            {showGuides && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-blue-900">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Guía de la Pizarra:</strong> Puedes arrastrar libremente cualquier unidad o incidencia con el ratón. En el panel izquierdo puedes cambiarles el nombre ("Incidencia 1", etc.) y mover los sliders de Gravedad y Tiempo de espera. Si hay más incidencias que unidades, el sistema trazará automáticamente las <strong>rutas secuenciales (Parada 1 ➔ Parada 2)</strong>.
                  </div>
                </div>
                <button
                  onClick={() => setShowGuides(false)}
                  className="text-blue-400 hover:text-blue-700 p-1"
                  title="Cerrar guía"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left: Quick Incident Sliders & Entities Drawer (4 Cols) */}
              <aside className="xl:col-span-4 flex flex-col gap-4">
                <WhiteboardSidebar
                  incidents={incidents}
                  brigades={brigades}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onUpdateIncidentInputs={handleUpdateIncidentInputs}
                  onUpdateIncidentTitle={handleUpdateIncidentTitle}
                  onAddIncident={handleAddIncident}
                  onDeleteIncident={handleDeleteIncident}
                  onAddBrigade={handleAddBrigade}
                  onDeleteBrigade={handleDeleteBrigade}
                />
              </aside>

              {/* Right: Spacious Whiteboard Canvas (8 Cols) */}
              <section className="xl:col-span-8 flex flex-col gap-4">
                <WhiteboardCanvas
                  brigades={brigades}
                  incidents={incidents}
                  outcome={dispatchOutcome}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onUpdateBrigadeLocation={handleUpdateBrigadeLocation}
                  onUpdateIncidentLocation={handleUpdateIncidentLocation}
                  onAddIncidentAt={handleAddIncidentAt}
                  onAddBrigadeAt={handleAddBrigadeAt}
                  onResetScenario={handleResetScenario}
                />
              </section>
            </div>
          </div>
        )}

        {/* Mamdani View */}
        {activeTab === 'mamdani' && selectedIncident && (
          <div className="flex flex-col gap-4">
            {showGuides && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-purple-900 max-w-[1500px] mx-auto w-full">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Guía de Mamdani:</strong> Las gráficas superiores muestran en qué función de pertenencia cae el valor del deslizador (línea vertical). El gráfico inferior muestra el área sombreada combinada y la línea roja vertical del <strong>Centroide (y*)</strong> que define el puntaje exacto de 0 a 100.
                  </div>
                </div>
                <button onClick={() => setShowGuides(false)} className="text-purple-400 hover:text-purple-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <MamdaniInspector
              incident={selectedIncident}
              allIncidents={incidents}
              onSelectIncident={setSelectedIncidentId}
            />
          </div>
        )}

        {/* Hungarian View */}
        {activeTab === 'hungarian' && (
          <div className="flex flex-col gap-4">
            {showGuides && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-emerald-900 max-w-[1500px] mx-auto w-full">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Guía del Algoritmo Húngaro:</strong> Haz clic en cualquier celda para ver la fórmula desglosada (ETA multiplicado por el factor de riesgo de la incidencia). Las celdas verdes representan la asignación óptima que minimiza la suma global de costos. Abajo verás las rutas que quedaron en la Parada 2.
                  </div>
                </div>
                <button onClick={() => setShowGuides(false)} className="text-emerald-400 hover:text-emerald-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <HungarianInspector
              outcome={dispatchOutcome}
              brigades={brigades}
              incidents={incidents}
            />
          </div>
        )}

        {/* Comparison View */}
        {activeTab === 'comparison' && (
          <ComparisonView brigades={brigades} incidents={incidents} />
        )}
        </div>
        )}
      </main>

      {/* Educational Math Modal */}
      <MathModal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} />
    </div>
  )
}

export default App
