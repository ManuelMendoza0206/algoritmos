# FuzzyDispatch (SmartBrigade) — Centro de Control de Despacho Táctico

Centro de control de despacho en tiempo real diseñado para simular, evaluar y optimizar la asignación de brigadas de emergencia ante incidencias urbanas mediante **Lógica Difusa (Mamdani FIS)** y el **Algoritmo Húngaro (Kuhn-Munkres)**.

---

## 🚀 Inicio Rápido

Para iniciar el servidor de desarrollo interactivo:

```bash
npm run dev
```

La aplicación abrirá en `http://localhost:5173/` con recarga rápida en caliente (HMR).

Para compilar la versión optimizada para producción:

```bash
npm run build
```

Para previsualizar el bundle de producción:

```bash
npm run preview
```

---

## 🏛️ Arquitectura del Sistema

El proyecto está construido 100% en el cliente con **React 19 + TypeScript + Vite + Tailwind CSS**, siguiendo los estándares de diseño táctico **Impeccable (modo Operate)**:

```
src/
├── algorithms/
│   ├── fuzzy/
│   │   ├── types.ts              # Tipos de conjuntos difusos y reglas
│   │   ├── membership.ts         # Funciones trimf y trapmf
│   │   └── mamdaniEngine.ts      # Fuzzificación, T-norma Min, S-norma Max y COA
│   ├── hungarian/
│   │   ├── types.ts              # Tipos de emparejamiento y pasos
│   │   └── hungarianAlgorithm.ts # Algoritmo Kuhn-Munkres O(N³) con historial de reducción
│   └── dispatch/
│       └── dispatchEngine.ts     # Generador de matrices y acoplamiento tiempo-riesgo
├── components/
│   ├── layout/
│   │   └── Header.tsx            # Presets, toggle de modos y KPIs
│   ├── map/
│   │   └── TacticalMap.tsx       # Plano SVG táctico con vectores animados y pines interactivos
│   ├── inputs/
│   │   └── IncidentEditor.tsx    # Sliders en tiempo real (Gravedad, Impacto, Espera)
│   ├── inspector/
│   │   ├── MamdaniInspector.tsx  # Gráficas SVG de curvas y área sombreada del centroide
│   │   └── HungarianInspector.tsx# Matriz de costos NxN y desglose de celda
│   └── modal/
│       └── MathModal.tsx         # Modal educativo de fundamentos matemáticos
├── data/
│   └── presets.ts                # Escenarios predefinidos para la sustentación
└── utils/
    └── priorityStyles.ts         # Paleta cromática semántica para estados y prioridades
```

---

## 🎓 Guía para la Demostración en Clase (10 Segundos de Impacto)

1. **Apertura Limpia**:
   - Carga el escenario predefinido `"Falla Crítica vs Falla Leve"`.
   - Muestra el mapa táctico con dos incidencias: una falla de soporte vital en el Hospital y una farola parpadeando en la plaza al lado de la base.
2. **Contraste de Algoritmos**:
   - Activa el **Modo Clásico (Solo distancia)**: Observa cómo la Brigada Alfa es enviada a la plaza a 1.4 km, forzando a la Brigada Beta a recorrer 16.6 km hacia el hospital con un retraso crítico de 25 minutos.
   - Cambia a **Modo Inteligente (Mamdani + Húngaro)**: En vivo y sin recargar la página, las líneas vectoriales se reconfiguran: Alfa es reasignada al hospital en 7.6 minutos (salvando 17 minutos cruciales) y la falla de la plaza espera a la brigada secundaria.
3. **Mamdani en Vivo**:
   - Mueve los sliders de *Gravedad*, *Impacto* o *Tiempo de Espera* en el panel izquierdo.
   - Muestra en la pestaña **Inspector Difuso Mamdani** cómo cambia la curva agregada, la línea del centroide $y^*$ y qué reglas difusas se activan.
4. **Transparencia Matemática**:
   - Abre la pestaña **Inspector Matriz Húngaro** para mostrar la matriz $N \times N$, los pasos de reducción de Kuhn-Munkres y el desglose analítico de la fórmula de costo multi-criterio.
