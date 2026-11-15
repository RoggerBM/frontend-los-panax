/**
 * Escenarios de simulación de riesgos.
 * badge: [texto, tono]  ·  risks: [porcentaje, nivel, tono]  ·  tonos: ok | info | warn | danger
 */
export const SCENARIOS = {
  nominal: {
    label: '1. Nominal orbital',
    tone: 'ok',
    eva: { label: 'APTO EVA • 98%', tone: 'ok' },
    cardio: { hr: 67, hrv: 56, badge: ['NOMINAL', 'ok'], sub: 'PA: 117/75 mmHg • VFC: 56 ms', pct: 94 },
    temp: { value: '36.8', badge: ['VERIFICADO', 'ok'], sub: 'T1: 36.7° | T2: 36.8° (Δ 0.1°C)', pct: 96 },
    sleep: { hours: 7.2, badge: ['6500K DÍA', 'info'], sub: 'Ánimo: 4/5 • Somnolencia KSS: 3/9', pct: 90 },
    rad: { value: '0.70', badge: ['ALARA OK', 'ok'], sub: 'JPM: 14.52 µGy/h vs Col: 17.41 µGy/h', pct: 23 },
    sans: { pvt: 265, sub: 'Rejilla Amsler: recta • Apto EVA' },
    nutri: { gluc: 92, water: '2.4L', badge: ['BALANCEADO', 'ok'], sub: 'Hidratación: 2.4 L/d • Calórico: 96%', pct: 91 },
    spo2: 'SPO2 99% • 14 resp/m',
    risks: { rad: [18, 'BAJO', 'ok'], neuro: [14, 'BAJO', 'ok'], cardio: [16, 'BAJO', 'ok'] },
    triage: {
      tag: 'RADIACIÓN',
      tone: 'info',
      title: 'Exposición a radiación dentro de límites ALARA',
      reason: 'Motivo: la tasa de dosis actual en ISS JPM (0.70 mSv/d) es nominal.',
      bullets: [
        'Continuar operaciones nominales de la estación.',
        'Monitorear presupuesto acumulado de carrera (límite NASA 600 mSv).',
      ],
    },
  },
  sensor: {
    label: '2. Fallo sensor (>1°C)',
    tone: 'warn',
    eva: { label: 'REVISIÓN • 84%', tone: 'warn' },
    cardio: { hr: 74, hrv: 49, badge: ['NOMINAL', 'ok'], sub: 'PA: 121/78 mmHg • VFC: 49 ms', pct: 89 },
    temp: { value: '37.9', badge: ['DERIVA Δ>1°C', 'warn'], sub: 'T1: 36.8° | T2: 38.1° (Δ 1.3°C)', pct: 64 },
    sleep: { hours: 7.0, badge: ['6500K DÍA', 'info'], sub: 'Ánimo: 4/5 • Somnolencia KSS: 4/9', pct: 86 },
    rad: { value: '0.72', badge: ['ALARA OK', 'ok'], sub: 'JPM: 14.80 µGy/h vs Col: 17.50 µGy/h', pct: 24 },
    sans: { pvt: 278, sub: 'Rejilla Amsler: recta • Apto EVA' },
    nutri: { gluc: 95, water: '2.3L', badge: ['BALANCEADO', 'ok'], sub: 'Hidratación: 2.3 L/d • Calórico: 94%', pct: 89 },
    spo2: 'SPO2 98% • 15 resp/m',
    risks: { rad: [20, 'BAJO', 'ok'], neuro: [24, 'BAJO', 'ok'], cardio: [22, 'BAJO', 'ok'] },
    triage: {
      tag: 'SENSOR DUAL',
      tone: 'warn',
      title: 'Discrepancia de termistor redundante (Δ 1.3°C)',
      reason: 'Motivo: el sensor cutáneo T2 diverge >1.0°C respecto al núcleo T1 sin taquicardia asociada.',
      bullets: [
        'Aislar canal T2 y recalibrar nodo biométrico del traje.',
        'Validar temperatura timpánica manual antes de iniciar EVA.',
      ],
    },
  },
  solar: {
    label: '3. Tormenta solar + fiebre',
    tone: 'danger',
    eva: { label: 'NO APTO EVA • 52%', tone: 'danger' },
    cardio: { hr: 112, hrv: 28, badge: ['TAQUICARDIA', 'danger'], sub: 'PA: 138/88 mmHg • VFC: 28 ms', pct: 58 },
    temp: { value: '38.6', badge: ['FIEBRE ALERTA', 'danger'], sub: 'T1: 38.6° | T2: 38.5° (Δ 0.1°C)', pct: 52 },
    sleep: { hours: 5.4, badge: ['2700K REPOSO', 'warn'], sub: 'Ánimo: 2/5 • Somnolencia KSS: 7/9', pct: 62 },
    rad: { value: '4.85', badge: ['TORMENTA SPE', 'danger'], sub: 'JPM: 98.4 µGy/h vs Col: 112.0 µGy/h', pct: 86 },
    sans: { pvt: 365, sub: 'Rejilla Amsler: leve ondulación' },
    nutri: { gluc: 118, water: '1.7L', badge: ['ESTRÉS METAB.', 'warn'], sub: 'Hidratación: 1.7 L/d • Electrolitos bajos', pct: 68 },
    spo2: 'SPO2 95% • 22 resp/m',
    risks: { rad: [86, 'CRÍTICO', 'danger'], neuro: [64, 'MODERADO', 'warn'], cardio: [72, 'ALTO', 'danger'] },
    triage: {
      tag: 'EMERGENCIA SPE',
      tone: 'danger',
      title: 'Evento de partículas solares + respuesta febril',
      reason: 'Motivo: flujo RadLab elevado (4.85 mSv/d) acompañado de hipertermia (38.6°C) y 112 LPM.',
      bullets: [
        'Trasladar tripulación al refugio blindado de polietileno (Módulo Zvezda / Columbus).',
        'Administrar protocolo antipirético + hidratación oral isotónica 500 mL/h.',
      ],
    },
  },
  mars: {
    label: '4. Cambio Marte 0.38g',
    tone: 'warn',
    eva: { label: 'ADAPTACIÓN • 79%', tone: 'warn' },
    cardio: { hr: 88, hrv: 41, badge: ['CARGA 0.38G', 'warn'], sub: 'PA: 104/68 mmHg • VFC: 41 ms', pct: 76 },
    temp: { value: '37.0', badge: ['VERIFICADO', 'ok'], sub: 'T1: 37.0° | T2: 37.1° (Δ 0.1°C)', pct: 92 },
    sleep: { hours: 6.8, badge: ['6500K DÍA', 'info'], sub: 'Ánimo: 3/5 • Somnolencia KSS: 4/9', pct: 82 },
    rad: { value: '1.15', badge: ['SUPERFICIE', 'warn'], sub: 'GCR Marte: 23.9 µGy/h • Blindaje regolito', pct: 42 },
    sans: { pvt: 295, sub: 'Rejilla Amsler: recta • Presión PIC baja' },
    nutri: { gluc: 89, water: '2.6L', badge: ['BALANCEADO', 'ok'], sub: 'Hidratación: 2.6 L/d • Carga salina OK', pct: 88 },
    spo2: 'SPO2 98% • 16 resp/m',
    risks: { rad: [42, 'MODERADO', 'warn'], neuro: [31, 'BAJO', 'ok'], cardio: [58, 'MODERADO', 'warn'] },
    triage: {
      tag: 'GRAVEDAD 0.38G',
      tone: 'warn',
      title: 'Redistribución ortostática en transición a 0.38g',
      reason: 'Motivo: descenso de presión arterial (104/68 mmHg) por retorno venoso hacia extremidades inferiores.',
      bullets: [
        'Activar prendas de compresión graduada en miembros inferiores.',
        'Completar protocolo de carga hídrica y sodio antes de caminata superficial.',
      ],
    },
  },
}

export const SCENARIO_KEYS = Object.keys(SCENARIOS)

/** Protocolos al hacer clic en las etiquetas del escáner 3D. rotY: ángulo al que gira el modelo. */
export const CALLOUT_PROTOCOLS = {
  cns: {
    rotY: -0.25,
    head: 'SNC // OCULAR SANS',
    tag: 'SNC / SANS',
    title: 'Protocolo neuro-ocular SANS (síndrome neuro-ocular asociado al vuelo)',
    reason: 'Motivo: monitoreo continuo de presión intracraneal y tiempo de reacción psicomotora (PVT).',
    bullets: [
      'Realizar prueba semanal de rejilla de Amsler y tonometría ocular.',
      'Aplicar presión negativa en parte inferior del cuerpo (LBNP) 30 min/día.',
    ],
  },
  rad: {
    rotY: 2.75,
    head: 'RADLAB // ALARA',
    tag: 'DOSIMETRÍA',
    title: 'Telemetría dosimétrica NASA RadLab (ISS JPM / Columbus)',
    reason: 'Motivo: integración directa con detectores de partículas cargadas y neutrones en órbita baja.',
    bullets: [
      'Verificar pronóstico de clima espacial NOAA antes de abrir escotilla.',
      'Registrar dosis efectiva acumulada en perfil biomédico individual.',
    ],
  },
  cardio: {
    rotY: 0.15,
    head: 'CARDIO // CAMBIO 0G',
    tag: 'CARDIO 0G',
    title: 'Control de desacondicionamiento cardiovascular en microgravedad',
    reason: 'Motivo: desplazamiento cefálico de ~2 litros de fluido intravascular en ausencia de gravedad.',
    bullets: [
      'Completar sesión diaria en ergómetro CEVIS y resistencia ARED.',
      'Mantener variabilidad de frecuencia cardíaca (VFC) por encima de 45 ms.',
    ],
  },
  metab: {
    rotY: 0.45,
    head: 'METABÓLICO // H2O',
    tag: 'METABÓLICO',
    title: 'Balance hídrico, glucémico y electrolítico orbital',
    reason: 'Motivo: prevención de pérdida de masa ósea, deshidratación y cálculos renales en órbita.',
    bullets: [
      'Ingesta objetivo de 2.4 L/día con suplementación de citrato de potasio.',
      'Mantener aporte proteico ≥ 1.4 g/kg/día para preservar masa muscular.',
    ],
  },
}

export const ENVIRONMENTS = [
  'ISS LEO (0g • Retraso 0.0s)',
  'Lunar Gateway (0g • Retraso 1.3s)',
  'Tránsito Marte (0g • Retraso 14.2m)',
  'Superficie Marte (0.38g • Retraso 20m)',
]

export const PIPELINE_STEPS = [
  { id: 'detect', label: ['1.', 'DETECTAR'] },
  { id: 'assess', label: ['2. EVALUAR', 'RIESGO'] },
  { id: 'recommend', label: ['3.', 'RECOMENDAR'] },
  { id: 'protect', label: ['4.', 'PROTEGER'] },
]

export const SCANNER_MODES = [
  { id: 'astronaut', label: 'Traje astronauta 3D' },
  { id: 'heart', label: 'Núcleo cardíaco 3D' },
  { id: 'hazard', label: 'Esfera de riesgo 3D' },
]

/** Fatiga (tarjeta SANS) según el veredicto de la validación post-login. */
export const VERDICT_FATIGUE = {
  ok: { badge: ['ÓPTIMO', 'ok'], pct: 94 },
  caution: { badge: ['FATIGA MODERADA', 'warn'], pct: 72 },
  fail: { badge: ['FATIGA ALTA', 'danger'], pct: 50 },
}
