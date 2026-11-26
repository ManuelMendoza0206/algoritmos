import { useState, useMemo, useCallback } from 'react'
import { Navbar, type NavTab } from './components/layout/Navbar.tsx'
import { WhiteboardCanvas } from './components/map/WhiteboardCanvas.tsx'
import { WhiteboardSidebar } from './components/inputs/WhiteboardSidebar.tsx'
import { MamdaniInspector } from './components/inspector/MamdaniInspector.tsx'
import { HungarianInspector } from './components/inspector/HungarianInspector.tsx'
import { ComparisonView } from './components/comparison/ComparisonView.tsx'
import { MathModal } from './components/modal/MathModal.tsx'
import { PRESET_SCENARIOS, type ScenarioPreset } from './data/presets.ts'
import { evaluateMamdani } from './algorithms/fuzzy/mamdaniEngine.ts'
import { runDispatchEngine } from './algorithms/dispatch/dispatchEngine.ts'
import type { DispatchMode, Incident, Brigade, Point } from './types/dispatch.ts'

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('whiteboard')
  const [activePresetId, setActivePresetId] = useState<string>('falla-critica')
  const [mode, setMode] = useState<DispatchMode>('smart')
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false)

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
      const nextNum = incidents.length + 1
      const newId = `INC-${Date.now().toString().slice(-4)}`
      const defaultInputs = { severity: 6.5, impact: 6.0, waitTime: 45 }
      const newInc: Incident = {
        id: newId,
        code: `INC-0${nextNum}`,
        title: `Incidencia ${nextNum}`,
        sector: 'Zona Urbana Central',
        location,
        severity: defaultInputs.severity,
        impact: defaultInputs.impact,
        waitTime: defaultInputs.waitTime,
        mamdani: evaluateMamdani(defaultInputs),
      }

      setIncidents((prev) => [...prev, newInc])
      setSelectedIncidentId(newId)
    },
    [incidents.length]
  )

  // Handle Adding Brigade on Whiteboard Click
  const handleAddBrigadeAt = useCallback(
    (location: Point) => {
      const nextNum = brigades.length + 1
      const newId = `B${nextNum}`
      const newBrigade: Brigade = {
        id: newId,
        code: `B-0${nextNum}`,
        name: `Unidad de Rescate 0${nextNum}`,
        location,
        specialty: 'Soporte Vital',
        speedKmH: 48,
        status: 'available',
      }
      setBrigades((prev) => [...prev, newBrigade])
    },
    [brigades.length]
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
      />

      {/* Main Surface View Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'whiteboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: Quick Incident Sliders & Entities Drawer (4 Cols) */}
            <aside className="xl:col-span-4 flex flex-col gap-4">
              <WhiteboardSidebar
                incidents={incidents}
                brigades={brigades}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={setSelectedIncidentId}
                onUpdateIncidentInputs={handleUpdateIncidentInputs}
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
        )}

        {activeTab === 'mamdani' && selectedIncident && (
          <MamdaniInspector
            incident={selectedIncident}
            allIncidents={incidents}
            onSelectIncident={setSelectedIncidentId}
          />
        )}

        {activeTab === 'hungarian' && (
          <HungarianInspector
            outcome={dispatchOutcome}
            brigades={brigades}
            incidents={incidents}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonView brigades={brigades} incidents={incidents} />
        )}
      </main>

      {/* Educational Math Modal */}
      <MathModal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} />
    </div>
  )
}

export default App
