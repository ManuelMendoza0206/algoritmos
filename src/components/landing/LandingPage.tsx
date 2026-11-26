import React, { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Play,
  Gauge,
  Route,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { PRESET_SCENARIOS } from '../../data/presets.ts'
import { runDispatchEngine, riskMultiplier } from '../../algorithms/dispatch/dispatchEngine.ts'
import type { DispatchMode } from '../../types/dispatch.ts'
import { DispatchDiagram } from './DispatchDiagram.tsx'

interface LandingPageProps {
  onStartSimulation: () => void
  onOpenMath: () => void
}

const es = (value: number, digits = 1) => value.toFixed(digits).replace('.', ',')

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSimulation, onOpenMath }) => {
  const [mode, setMode] = useState<DispatchMode>('smart')

  const flagship = PRESET_SCENARIOS[0]
  const deficit = PRESET_SCENARIOS[1]

  const classic = useMemo(
    () => runDispatchEngine(flagship.brigades, flagship.incidents, 'classic'),
    [flagship]
  )
  const smart = useMemo(
    () => runDispatchEngine(flagship.brigades, flagship.incidents, 'smart'),
    [flagship]
  )
  const deficitClassic = useMemo(
    () => runDispatchEngine(deficit.brigades, deficit.incidents, 'classic'),
    [deficit]
  )
  const deficitSmart = useMemo(
    () => runDispatchEngine(deficit.brigades, deficit.incidents, 'smart'),
    [deficit]
  )

  const classicCritical = classic.kpis.criticalEtaMinutes
  const smartCritical = smart.kpis.criticalEtaMinutes
  const criticalGain = classicCritical - smartCritical
  const distanceDelta = smart.kpis.totalDistanceKm - classic.kpis.totalDistanceKm

  const routes = flagship.incidents.map((incident) => ({
    incident,
    classic: classic.assignments.find((a) => a.incidentId === incident.id),
    smart: smart.assignments.find((a) => a.incidentId === incident.id),
  }))

  const chains = deficitSmart.immediateAssignments.map((first) => ({
    brigade: first.brigade,
    stops: [
      first,
      ...deficitSmart.queuedAssignments.filter((q) => q.brigadeId === first.brigadeId),
    ],
  }))

  const priorities = [0, 25, 50, 75, 100]

  return (
    <div className="landing-type text-slate-900">
      {/* ============ HERO ============ */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
          <div className="min-w-0">
            <h1 className="max-w-[16ch] text-balance text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[3.45rem]">
              La unidad más cercana no siempre es la correcta.
            </h1>

            <p className="mt-6 max-w-[58ch] text-[15px] leading-7 text-slate-600 sm:text-base">
              FuzzyDispatch simula emergencias urbanas, calcula su prioridad con lógica difusa
              Mamdani y resuelve la asignación global con el algoritmo Húngaro. La unidad que
              minimiza el daño total, no la que está a la vuelta de la esquina.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartSimulation}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.8)] transition-colors hover:bg-blue-700"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Abrir la pizarra
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenMath}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                <BookOpen className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Ver los fundamentos
              </button>
            </div>

            <p className="landing-mono mt-6 text-[9px] uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.16em]">
              27 reglas difusas · O(N³) · 100 % en el navegador
            </p>
          </div>

          <div className="mx-auto w-full max-w-[560px] min-w-0">
            <DispatchDiagram
              brigades={flagship.brigades}
              incidents={flagship.incidents}
              classic={classic}
              smart={smart}
              mode={mode}
              onModeChange={setMode}
              label="Escenario · Falla crítica vs falla leve"
            />
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Cambia el modo en el panel: el plano, las rutas y los tiempos salen del mismo motor
              que usa la pizarra.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section className="border-t border-slate-200">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div className="min-w-0">
              <h2 className="max-w-[18ch] text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900 sm:text-4xl">
                El vecino más cercano no es una estrategia.
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-600">
                <p>
                  Un despacho voraz asigna cada unidad a la incidencia más próxima. Funciona hasta
                  que dos casos compiten: una farola fundida a 1,4 km y una falla de soporte vital a
                  6,4 km.
                </p>
                <p>
                  La unidad rápida se va a la farola. El hospital espera a una unidad que está a
                  16,6 km. El sistema hizo exactamente lo que le pediste y aun así falló en el caso
                  que importaba.
                </p>
                <p className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 ring-1 ring-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>
                    El error no está en la distancia. Está en decidir con una sola variable cuando
                    el problema tiene tres: gravedad, impacto y tiempo de espera.
                  </span>
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr className="landing-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-4 py-3 font-medium">Incidencia</th>
                        <th className="px-4 py-3 font-medium">
                          <span className="sm:hidden">Distancia</span>
                          <span className="hidden sm:inline">Solo distancia</span>
                        </th>
                        <th className="px-4 py-3 font-medium text-blue-800">
                          <span className="sm:hidden">Inteligente</span>
                          <span className="hidden sm:inline">Mamdani + Húngaro</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {routes.map(({ incident, classic: c, smart: s }) => {
                        const isCritical = incident.mamdani.level === 'Crítica'
                        return (
                          <tr key={incident.id} className={isCritical ? 'bg-rose-50/40' : undefined}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${
                                    isCritical ? 'bg-rose-600' : 'bg-emerald-600'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="font-medium text-slate-900">{incident.title}</span>
                              </div>
                              <div className="landing-mono mt-1 text-[10px] text-slate-500">
                                prioridad {incident.mamdani.score} · {incident.mamdani.level}
                              </div>
                            </td>
                            <td className="landing-mono px-4 py-4 text-slate-700">
                              {c ? (
                                <>
                                  <span className="font-semibold text-slate-900">{c.brigade.code}</span>
                                  <span className="text-slate-400"> · </span>
                                  {c.cumulativeEtaMinutes} min
                                </>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="landing-mono px-4 py-4">
                              {s ? (
                                <>
                                  <span className="font-semibold text-blue-800">{s.brigade.code}</span>
                                  <span className="text-slate-400"> · </span>
                                  <span
                                    className={
                                      isCritical ? 'font-semibold text-emerald-700' : 'text-slate-700'
                                    }
                                  >
                                    {s.cumulativeEtaMinutes} min
                                  </span>
                                </>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-slate-200 px-4 py-3 text-[11px] leading-5 text-slate-600">
                  El modo inteligente recorre {es(distanceDelta)} km más en total para llegar{' '}
                  <strong className="font-semibold text-slate-900">{es(criticalGain)} min antes</strong>{' '}
                  al hospital. Ese es el intercambio que el algoritmo decide por ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT DECIDES ============ */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
            <div className="min-w-0">
              <h2 className="max-w-[16ch] text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900 sm:text-4xl">
                La prioridad entra en el costo, no en el desempate.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-7 text-slate-600">
                Cada incidencia recibe un puntaje de 0 a 100. Ese puntaje no se usa para ordenar una
                lista: se multiplica por el tiempo de llegada, así que un caso crítico pesa más en la
                suma global que el resto.
              </p>

              <ol className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
                {[
                  {
                    title: 'Fuzzificar',
                    body: 'Gravedad, impacto y espera se convierten en grados de pertenencia continuos, sin umbrales binarios.',
                    formula: 'μ_Baja, μ_Media, μ_Alta',
                  },
                  {
                    title: 'Inferir',
                    body: '27 reglas se activan con la T-norma de mínimo. Se agregan con máximo y el centroide devuelve un puntaje nítido.',
                    formula: 'y* = ∫ y · μ(y) dy / ∫ μ(y) dy',
                  },
                  {
                    title: 'Asignar',
                    body: 'El Húngaro recorre la matriz de costos y elige la permutación de costo total mínimo en O(N³).',
                    formula: 'min Σ C(i,j)',
                  },
                ].map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                    <span className="landing-mono text-[11px] font-medium text-slate-500">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-1 text-[13px] leading-6 text-slate-600">{step.body}</p>
                      <code className="landing-mono mt-2 inline-block text-[11px] text-slate-700">
                        {step.formula}
                      </code>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="min-w-0 space-y-6">
              {/* The one dark instrument panel */}
              <div className="blueprint-grid-dark rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.8)] sm:p-8">
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                  Modelo de costo
                </div>
                <p className="landing-mono mt-4 text-[11px] leading-7 text-blue-300 sm:text-sm">
                  C(i,j) = ETA(i,j) × (0.5 + 2.8 × P_j / 100)
                </p>
                <p className="mt-3 text-[13px] leading-6 text-slate-300">
                  P_j es la prioridad Mamdani de la incidencia j. El factor va de 0,5 a 3,3: un caso
                  crítico vale hasta 6,6 veces más que uno trivial en la misma celda.
                </p>

                <div className="mt-6 space-y-3">
                  {routes.map(({ incident, smart: s }) => (
                    <div key={incident.id} className="flex items-center justify-between gap-4">
                      <span className="flex min-w-0 items-center gap-2 text-xs text-slate-300">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            incident.mamdani.level === 'Crítica' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{incident.code}</span>
                      </span>
                      <span className="landing-mono shrink-0 text-xs text-slate-400">
                        P {incident.mamdani.score} → factor{' '}
                        <strong className="font-semibold text-white">
                          {riskMultiplier(incident.mamdani.score).toFixed(2)}
                        </strong>
                        {s && (
                          <span className="text-slate-500">
                            {' '}
                            · {s.cumulativeEtaMinutes} min
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-700 pt-5">
                  <p className="text-[11px] leading-5 text-slate-400">
                    Una penalización sumada por columna, <span className="landing-mono">ETA + K·(100−P)</span>,
                    no cambia nada: toda asignación completa cubre cada columna una vez y la suma de
                    penalizaciones es constante. Multiplicar sí acopla tiempo y riesgo.
                  </p>
                </div>
              </div>

              {/* Priority scale, plain data */}
              <div className="rounded-2xl border border-slate-300 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900">El factor, en la escala real</h3>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {priorities.map((p) => (
                    <div key={p} className="text-center">
                      <div className="landing-mono text-[10px] text-slate-500">P {p}</div>
                      <div className="landing-mono mt-1 border-t-2 border-blue-600 pt-1 text-xs font-semibold text-slate-900">
                        {riskMultiplier(p).toFixed(1)}×
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-slate-600">
                  El factor crece en línea recta con la prioridad. No hay saltos: dos casos parecidos
                  reciben un costo parecido.
                </p>
              </div>
            </div>
          </div>

          {/* Two-stop dispatch */}
          <div className="mt-14 border-t border-slate-200 pt-12 sm:mt-20 sm:pt-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
              <div className="min-w-0">
                <h2 className="max-w-[18ch] text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900 sm:text-4xl">
                  Cuando hay más incidencias que unidades.
                </h2>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-7 text-slate-600">
                  El motor no deja casos sin atender por falta de unidades. Resuelve una primera
                  parada y programa una segunda sobre las unidades que ya terminaron su servicio.
                </p>
                <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-slate-600">
                  La segunda parada sale desde la incidencia atendida, no desde la base, y suma 15
                  minutos de servicio al reloj. Una unidad que termina tarde no puede robar un caso
                  cercano a una que ya está libre.
                </p>

                <div className="mt-8 space-y-3">
                  {chains.map(({ brigade, stops }) => (
                    <div
                      key={brigade.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 pt-3"
                    >
                      <span className="landing-mono w-14 shrink-0 text-xs font-semibold text-slate-900">
                        {brigade.code}
                      </span>
                      {stops.map((stop, index) => (
                        <React.Fragment key={`${stop.incidentId}-${stop.stopOrder}`}>
                          {index > 0 && (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          )}
                          <span className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span
                              className={`landing-mono rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                stop.stopOrder === 1
                                  ? 'bg-blue-50 text-blue-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {stop.incident.code}
                            </span>
                            <span className="landing-mono text-[11px] text-slate-500">
                              {stop.cumulativeEtaMinutes} min
                            </span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto w-full max-w-[460px] min-w-0 lg:max-w-none">
                <DispatchDiagram
                  brigades={deficit.brigades}
                  incidents={deficit.incidents}
                  classic={deficitClassic}
                  smart={deficitSmart}
                  mode="smart"
                  showLegend={false}
                  compact
                  label="Escenario · 2 unidades vs 4 incidencias"
                />
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-blue-600" aria-hidden="true" />
                    Parada 1
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-amber-600" aria-hidden="true" />
                    Parada 2
                  </span>
                  <span className="landing-mono text-slate-500">M &lt; N</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DEMO RUN SHEET ============ */}
      <section className="border-t border-slate-200">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900 sm:text-4xl">
                Guion de demo para la clase.
              </h2>
              <p className="mt-3 max-w-[56ch] text-[15px] leading-7 text-slate-600">
                Cuatro pasos, menos de un minuto. El contraste entre modos es el argumento.
              </p>
            </div>
            <span className="landing-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Escenario 01 · Falla crítica vs falla leve
            </span>
          </div>

          <ol className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
            {[
              {
                action: 'Abre la pizarra y carga el escenario.',
                observe: 'U-01 arranca junto a la plaza; el hospital queda lejos, sobre la diagonal.',
              },
              {
                action: 'Cambia a «Solo distancia».',
                observe: `U-01 va a la farola. El hospital lo cubre U-02 en ${es(classicCritical)} min.`,
              },
              {
                action: 'Activa «Mamdani + Húngaro».',
                observe: `U-01 se reasigna al hospital: ${es(smartCritical)} min. ${es(criticalGain)} min menos en el caso crítico.`,
              },
              {
                action: 'Abre «Matriz Húngara» y haz clic en una celda.',
                observe: 'Verás ETA × factor, la reducción de Kuhn-Munkres y la tabla de Parada 2.',
              },
            ].map((step, index) => (
              <li key={step.action} className="grid gap-2 py-5 sm:grid-cols-[3.5rem_1fr_1.1fr] sm:gap-6">
                <span className="landing-mono text-2xl font-medium leading-none text-slate-500 sm:text-3xl">
                  0{index + 1}
                </span>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <h3 className="text-sm font-semibold leading-6 text-slate-900">{step.action}</h3>
                </div>
                <p className="text-[13px] leading-6 text-slate-600 sm:pl-0">{step.observe}</p>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Route className="h-4 w-4" aria-hidden="true" />
              Iniciar la demostración
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenMath}
              className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 hover:decoration-slate-500"
            >
              Leer la formulación completa
            </button>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-8 flex flex-wrap items-center justify-between gap-3">
          <p className="landing-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            FuzzyDispatch · React 19 + Vite + Tailwind
          </p>
          <p className="text-[11px] text-slate-500">
            Sin servidor, sin base de datos: todo se calcula en el navegador.
          </p>
        </div>
      </footer>
    </div>
  )
}
