import clsx from 'clsx'
import { ChevronRight, UserRound } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BiometricCheck, getUserById, getUsers } from '@/features/auth'
import BlockIntro from '../components/BlockIntro'
import HudButton from '../components/HudButton'
import ValidationIntro from '../components/ValidationIntro'
import ValidationResult from '../components/ValidationResult'
import { TESTS } from '../config/tests'
import { VALIDATION_BLOCKS } from '../config/validation'
import { useFatigueResults } from '../context/fatigueResultsContext'
import { useTestHistory } from '../hooks/useTestHistory'
import { evaluateValidation } from '../logic/verdict'
import { TEST_COMPONENTS } from '../tests'

const HISTORY_KEY = 'validation'
const BACK_TO = '/mod/fat'

/** Paso 1: elegir qué tripulante hará el test (su identidad se confirma después con el escaneo). */
function OperatorPicker({ selectedId, onSelect, onContinue }) {
  const users = getUsers()
  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Operator</p>
        <h2 className="text-lg font-extrabold text-white">Who is taking the test?</h2>
        <p className="text-xs text-slate-400">Your identity will be confirmed with a face scan before the test starts.</p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {users.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => onSelect(u.id)}
              aria-pressed={selectedId === u.id}
              className={clsx(
                'flex w-full flex-col items-center gap-1.5 rounded-lg border-[1.5px] p-3 text-center transition',
                selectedId === u.id ? 'border-cyan bg-cyan/10' : 'border-line bg-void hover:border-cyan/60',
              )}
            >
              <img
                src={u.image}
                alt=""
                className={clsx('h-14 w-14 rounded-full object-cover ring-2', selectedId === u.id ? 'ring-cyan' : 'ring-line')}
              />
              <span className="text-xs font-semibold text-slate-100">{u.name}</span>
              <span className="font-mono text-[10px] text-slate-500">{u.crewCode}</span>
            </button>
          </li>
        ))}
      </ul>
      <HudButton icon={UserRound} disabled={!selectedId} onClick={onContinue}>
        Continue
      </HudButton>
    </div>
  )
}

/** Pasos 2+: introducción → validación biométrica → bloques → resultado, para un tripulante concreto. */
function FatigueTestRun({ user, onChangeOperator }) {
  const navigate = useNavigate()
  const { saveResult } = useFatigueResults()
  const { history, save } = useTestHistory(user.id)

  const [stage, setStage] = useState('intro') // intro | verify | block | running | result
  const [blockIndex, setBlockIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const resultsRef = useRef({})
  const verificationRef = useRef(null)

  const finish = useCallback(
    (results) => {
      const baseline = history[HISTORY_KEY]?.[0] ?? null
      const evaluation = evaluateValidation(results, baseline)
      const verifiedAt = verificationRef.current?.at ?? null
      save(HISTORY_KEY, { ...results, verdict: evaluation.verdict, verifiedAt })
      saveResult(user.id, { verdict: evaluation.verdict, times: evaluation.times, at: Date.now(), verifiedAt })
      setOutcome({ evaluation, isBaseline: !baseline })
      setStage('result')
    },
    [history, save, saveResult, user.id],
  )

  const handleBlockComplete = useCallback(
    (summary) => {
      const block = VALIDATION_BLOCKS[blockIndex]
      resultsRef.current = { ...resultsRef.current, [block.id]: summary }
      if (blockIndex + 1 < VALIDATION_BLOCKS.length) {
        setBlockIndex(blockIndex + 1)
        setStage('block')
      } else {
        finish(resultsRef.current)
      }
    },
    [blockIndex, finish],
  )

  // Cada intento (también "Retake") empieza con la validación biométrica
  const requestVerification = () => {
    verificationRef.current = null
    setOutcome(null)
    setStage('verify')
  }

  const start = (verification) => {
    verificationRef.current = verification
    resultsRef.current = {}
    setBlockIndex(0)
    setAttempt((a) => a + 1)
    setStage('block')
  }

  const block = VALIDATION_BLOCKS[blockIndex]
  const test = TESTS[block.id]
  const Runner = TEST_COMPONENTS[block.id]

  return (
    <>
      {stage === 'running' && (
        <p className="-mt-2 mb-3 text-right font-mono text-[10.5px] text-slate-400">
          {user.name} · Block {blockIndex + 1}/{VALIDATION_BLOCKS.length} · {test.name}
        </p>
      )}

      {stage === 'intro' && (
        <ValidationIntro user={user} onStart={requestVerification} onChangeOperator={onChangeOperator} />
      )}

      {stage === 'verify' && (
        <BiometricCheck user={user} testName="fatigue test" onVerified={start} onCancel={() => setStage('intro')} />
      )}

      {stage === 'block' && (
        <BlockIntro
          test={test}
          hint={block.hint}
          number={blockIndex + 1}
          total={VALIDATION_BLOCKS.length}
          onContinue={() => setStage('running')}
        />
      )}

      {stage === 'running' && (
        <Runner key={`${attempt}-${blockIndex}`} params={block.params} onComplete={handleBlockComplete} />
      )}

      {stage === 'result' && outcome && (
        <ValidationResult
          evaluation={outcome.evaluation}
          isBaseline={outcome.isBaseline}
          onDone={() => navigate(BACK_TO)}
          onRetry={requestVerification}
        />
      )}
    </>
  )
}

/**
 * Test de fatiga combinado (PVT + Go/No-Go + Stroop), abierto desde el módulo Fatigue & Sleep.
 * ?crew=<id> preselecciona al tripulante (p. ej. desde su ficha).
 */
export default function ValidationPage() {
  const [params] = useSearchParams()
  const preset = getUserById(params.get('crew') ?? '')
  const [selectedId, setSelectedId] = useState(preset?.id ?? null)
  const [operatorId, setOperatorId] = useState(preset?.id ?? null)
  const operator = operatorId ? getUserById(operatorId) : null

  return (
    <section className="animate-fade-in space-y-4">
      <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to={BACK_TO} className="hover:text-cyan">
          Fatigue &amp; Sleep
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-200">Fatigue test</span>
      </nav>

      <div className="mx-auto max-w-xl rounded-xl border-[1.5px] border-cyan/60 bg-panel p-4 sm:p-5">
        <p className="mb-4 font-mono text-[10.5px] font-bold uppercase tracking-widest text-cyan">
          Fatigue test · PVT + Go/No-Go + Stroop
        </p>

        {operator ? (
          <FatigueTestRun key={operator.id} user={operator} onChangeOperator={() => setOperatorId(null)} />
        ) : (
          <OperatorPicker selectedId={selectedId} onSelect={setSelectedId} onContinue={() => setOperatorId(selectedId)} />
        )}
      </div>
    </section>
  )
}
