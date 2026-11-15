import { useCallback, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import Panel from '@/shared/components/Panel'
import { useAuth } from '@/features/auth'
import BlockIntro from '../components/BlockIntro'
import ValidationIntro from '../components/ValidationIntro'
import ValidationResult from '../components/ValidationResult'
import { TESTS } from '../config/tests'
import { VALIDATION_BLOCKS } from '../config/validation'
import { useTestHistory } from '../hooks/useTestHistory'
import { evaluateValidation } from '../logic/verdict'
import { TEST_COMPONENTS } from '../tests'

const HISTORY_KEY = 'validation'

export default function ValidationPage() {
  const navigate = useNavigate()
  const { user, isValidated, completeValidation, logout } = useAuth()
  const { history, save } = useTestHistory(user.id)

  const [stage, setStage] = useState('intro') // intro | block | running | result
  const [blockIndex, setBlockIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const resultsRef = useRef({})

  const finish = useCallback(
    (results) => {
      const baseline = history[HISTORY_KEY]?.[0] ?? null
      const evaluation = evaluateValidation(results, baseline)
      save(HISTORY_KEY, { ...results, verdict: evaluation.verdict })
      setOutcome({ evaluation, isBaseline: !baseline })
      setStage('result')
    },
    [history, save],
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

  if (isValidated) return <Navigate to="/dashboard" replace />

  const start = () => {
    resultsRef.current = {}
    setBlockIndex(0)
    setAttempt((a) => a + 1)
    setOutcome(null)
    setStage('block')
  }

  const handleContinue = () => {
    const { verdict, times } = outcome.evaluation
    completeValidation({ verdict, times, at: Date.now() })
    navigate('/dashboard', { replace: true })
  }

  const block = VALIDATION_BLOCKS[blockIndex]
  const test = TESTS[block.id]
  const Runner = TEST_COMPONENTS[block.id]

  return (
    <div className="bg-grid min-h-screen">
      <header className="flex items-center justify-between border-b border-brand/20 bg-black/20 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper">
          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden /> Validación
        </span>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-paper/60 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Salir
        </button>
      </header>

      <main className="mx-auto max-w-xl p-4 sm:p-6">
        <Panel
          title={stage === 'running' ? `Bloque ${blockIndex + 1}/${VALIDATION_BLOCKS.length} · ${test.name}` : undefined}
        >
          {stage === 'intro' && <ValidationIntro user={user} onStart={start} />}

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
            <Runner
              key={`${attempt}-${blockIndex}`}
              params={block.params}
              onComplete={handleBlockComplete}
            />
          )}

          {stage === 'result' && outcome && (
            <ValidationResult
              evaluation={outcome.evaluation}
              isBaseline={outcome.isBaseline}
              onContinue={handleContinue}
              onRetry={start}
              onLogout={logout}
            />
          )}
        </Panel>
      </main>
    </div>
  )
}
