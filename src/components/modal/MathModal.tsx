import React from 'react'
import { X, BookOpen, AlertTriangle, Cpu, Calculator } from 'lucide-react'

interface MathModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MathModal: React.FC<MathModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fundamentos Matemáticos: Mamdani FIS y Algoritmo Húngaro
              </h3>
              <p className="text-xs text-slate-500">
                Sustentación teórica formal de la formulación algorítmica y multi-criterio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
          {/* Section 1: El dilema del despacho */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              1. El Dilema del Despacho Voraz (Greedy por Proximidad)
            </h4>
            <p className="mb-2">
              Los sistemas tradicionales de despacho asignan recursos basándose en la <strong>heurística voraz del vecino más cercano</strong>: cada unidad disponible atiende la incidencia físicamente más cercana.
            </p>
            <p className="text-slate-600">
              <strong className="text-rose-600">Falla crítica:</strong> Si una brigada rápida está a 1 km de un fallo trivial (e.g. alumbrado en un parque) y a 6 km de un hospital con fallo de soporte vital, el algoritmo voraz "secuestra" la brigada para el fallo trivial, obligando a enviar una segunda brigada lejana al hospital, acumulando un retraso letal de más de 20 minutos.
            </p>
          </div>

          {/* Section 2: Motor Mamdani */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              2. Sistema de Inferencia Difusa Mamdani (FIS)
            </h4>
            <p className="mb-3">
              Mamdani modela el criterio de expertos humanos sin umbrales rígidos binarios (0 o 1), procesando 3 variables de entrada con funciones de pertenencia continuas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-rose-600 block mb-1">Gravedad (0 - 10)</strong>
                <span className="text-slate-600">Baja, Media, Alta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-amber-700 block mb-1">Impacto (0 - 10)</strong>
                <span className="text-slate-600">Leve, Moderado, Crítico</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-blue-600 block mb-1">Espera (0 - 180 min)</strong>
                <span className="text-slate-600">Reciente, Moderada, Prolongada</span>
              </div>
            </div>

            <div className="space-y-2 text-slate-700">
              <p>
                <strong>T-norma de Mínimo (Implicación):</strong> Para cada regla k, la fuerza de disparo se calcula mediante:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-purple-700 text-center font-bold text-xs">
                α_k = min( μ_Gravedad(x_1), μ_Impacto(x_2), μ_Espera(x_3) )
              </div>
              <p>
                <strong>S-norma de Máximo (Agregación):</strong> Se combinan los consecuentes truncados de todas las reglas activas:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-purple-700 text-center font-bold text-xs">
                μ_agregada(y) = max_k ( min( α_k, μ_Consecuente,k(y) ) )
              </div>
              <p>
                <strong>Defuzzificación por Centroide de Área (COA):</strong> Convierte la curva difusa en un escalar continuo nítido y* en el intervalo [0, 100]:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-emerald-700 text-center font-bold text-xs">
                y* = ∫ y · μ_agregada(y) dy / ∫ μ_agregada(y) dy
              </div>
            </div>
          </div>

          {/* Section 3: Algoritmo Húngaro */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              3. Algoritmo Húngaro (Kuhn-Munkres)
            </h4>
            <p className="mb-2">
              Resuelve el problema de <strong>asignación óptima bipartita de coste mínimo</strong> en tiempo polinomial O(N³), basado en el Teorema de König:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 mb-3 pl-1">
              <li>
                <strong>Invarianza por reducción:</strong> Restar el mínimo de cualquier fila o columna conserva intacto el conjunto de soluciones óptimas de la matriz.
              </li>
              <li>
                <strong>Cero-cubrimiento:</strong> Si el número mínimo de líneas que cubren todos los ceros es igual a la dimensión N, existe una permutación de ceros independientes que conforma la asignación globalmente óptima.
              </li>
            </ul>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">
                ¿Por qué la función de costo acopla Tiempo × Riesgo?
              </strong>
              <p className="text-[11px] text-slate-600 mb-2">
                Si sumáramos una constante por columna C[i,j] = Dist[i,j] + (100 - P[j]), cualquier permutación cubre todas las columnas exactamente una vez, por lo que la suma de prioridades es constante y el Húngaro seleccionaría exactamente la misma solución que distancia pura.
              </p>
              <p className="text-[11px] text-slate-700">
                Por ello, modelamos el <strong>Costo de Riesgo Demorado Multiplicativo</strong>:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-blue-700 text-center font-bold text-xs mt-1">
                C[i,j] = ETA(B_i, I_j) × ( 0.5 + 2.8 × (Prioridad_j / 100) )
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Cada minuto de retraso para una emergencia de prioridad 95 cuesta 3.16× más que para una incidencia leve de prioridad 10, forzando matemáticamente al algoritmo Húngaro a proteger la vida humana sobre los kilómetros recorridos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Entendido, volver a la Pizarra
          </button>
        </div>
      </div>
    </div>
  )
}
