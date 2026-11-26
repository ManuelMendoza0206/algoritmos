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
              <p className="text-xs text-slate-600">
                Formulación completa: fuzzificación, inferencia, costo ponderado y rutas en dos paradas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar fundamentos matemáticos"
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
              1. El dilema del despacho voraz
            </h4>
            <p className="mb-2">
              Los sistemas tradicionales asignan recursos con la <strong>heurística del vecino más cercano</strong>: cada unidad atiende la incidencia físicamente más próxima.
            </p>
            <p className="text-slate-600">
              <strong className="text-rose-600">Falla crítica:</strong> una unidad rápida puede estar a 1,4 km de una farola fundida y a 6,4 km de una falla de soporte vital en un hospital. El criterio voraz la manda a la farola y obliga a una unidad lejana a cubrir el hospital: 25 minutos de retraso en el caso que sí importa.
            </p>
          </div>

          {/* Section 2: Motor Mamdani */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              2. Sistema de Inferencia Difusa Mamdani (FIS)
            </h4>
            <p className="mb-3">
              Mamdani modela el criterio de un jefe de despacho sin umbrales binarios, con tres variables de entrada y funciones de pertenencia continuas:
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
                <strong>T-norma de mínimo (implicación):</strong> la fuerza de disparo de cada regla k es
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-purple-700 text-center font-bold text-xs">
                α_k = min( μ_Gravedad(x_1), μ_Impacto(x_2), μ_Espera(x_3) )
              </div>
              <p>
                <strong>S-norma de máximo (agregación):</strong> se combinan los consecuentes truncados de las 27 reglas activas
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-purple-700 text-center font-bold text-xs">
                μ_agregada(y) = max_k ( min( α_k, μ_Consecuente,k(y) ) )
              </div>
              <p>
                <strong>Defuzzificación por centroide de área (COA):</strong> el resultado es un escalar nítido y* en [0, 100]
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
              Resuelve el problema de <strong>asignación óptima bipartita de coste mínimo</strong> en tiempo polinomial O(N³), basado en el teorema de König:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 mb-3 pl-1">
              <li>
                <strong>Invarianza por reducción:</strong> restar el mínimo de cualquier fila o columna conserva el conjunto de soluciones óptimas.
              </li>
              <li>
                <strong>Cero-cubrimiento:</strong> si el mínimo de líneas que cubren todos los ceros es igual a N, existe una permutación de ceros independientes y esa permutación es la asignación globalmente óptima.
              </li>
            </ul>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">
                Por qué el costo multiplica tiempo y riesgo
              </strong>
              <p className="text-[11px] text-slate-600 mb-2">
                Una penalización aditiva por columna, C[i,j] = ETA + K · (100 − P[j]), es <strong>invisible</strong> para el Húngaro: toda asignación completa cubre cada columna exactamente una vez, así que la suma de penalizaciones es constante y la solución coincide con la de distancia pura. Por eso el modo inteligente usa un costo no separable:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-blue-700 text-center font-bold text-xs mt-1">
                C[i,j] = ETA(B_i, I_j) × ( 0.5 + 2.8 × P_j / 100 )
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5">
                El factor va de 0,5 (prioridad 0) a 3,3 (prioridad 100). Un caso crítico pesa más, así que el solver acepta más tiempo de viaje para atenderlo primero: la prioridad ya no se cancela.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 mt-3">
              <strong className="text-slate-900 block mb-1 text-xs">
                Rutas en dos paradas cuando M &lt; N
              </strong>
              <p className="text-[11px] text-slate-600">
                La Parada 1 se resuelve con las matrices de origen de cada brigada. Si sobran incidencias, la Parada 2 usa como origen la incidencia atendida en la Parada 1 y suma <strong>15 min de servicio</strong> al reloj. El costo de la Parada 2 usa la <strong>llegada acumulada</strong>, no solo el tramo, para que una unidad que termina tarde no robe un caso cercano. Cuando faltan unidades, las filas ficticias del solver cobran el costo de aplazar: postergar un caso crítico nunca sale gratis.
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
            Entendido, volver a la pizarra
          </button>
        </div>
      </div>
    </div>
  )
}
