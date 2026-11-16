import { ScanFace, Timer } from 'lucide-react'
import FaceImage from '@/shared/components/FaceImage'
import { TESTS } from '../config/tests'
import { VALIDATION_BLOCKS, VALIDATION_DURATION } from '../config/validation'
import HudButton from './HudButton'

export default function ValidationIntro({ user, onStart, onChangeOperator }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <FaceImage person={user} badge="lg" className="h-20 w-20 rounded-xl border-2 border-cyan object-cover" />
        <div className="flex-1">
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-cyan">Operator</p>
          <h2 className="text-3xl font-extrabold text-white">{user.name}</h2>
        </div>
        {onChangeOperator && (
          <button
            type="button"
            onClick={onChangeOperator}
            className="rounded-lg border-2 border-slate-400/50 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan hover:text-cyan"
          >
            Change
          </button>
        )}
      </div>

      <p className="text-lg text-slate-100">
        A short alertness check that estimates your reaction times. It runs three blocks back to back:
      </p>

      <ol className="flex flex-col gap-3">
        <li className="flex items-center gap-4 rounded-xl border-2 border-cyan/70 bg-cyan/15 px-4 py-4">
          <span className="font-mono text-base font-bold text-cyan">0</span>
          <ScanFace className="h-7 w-7 shrink-0 text-cyan" aria-hidden />
          <div className="text-base">
            <p className="font-semibold text-slate-100">
              Biometric validation <span className="font-mono text-xs text-cyan">FACE SCAN</span>
            </p>
            <p className="text-sm text-slate-300">Confirms your identity with the camera before the blocks start.</p>
          </div>
        </li>
        {VALIDATION_BLOCKS.map((block, i) => {
          const test = TESTS[block.id]
          const Icon = test.icon
          return (
            <li key={block.id} className="flex items-center gap-4 rounded-xl border-2 border-slate-400/40 bg-white/5 px-4 py-4">
              <span className="font-mono text-base font-bold text-slate-200">{i + 1}</span>
              <Icon className="h-7 w-7 shrink-0 text-cyan" aria-hidden />
              <div className="text-base">
                <p className="font-semibold text-slate-100">
                  {test.name} <span className="font-mono text-xs text-cyan">{test.tag}</span>
                </p>
                <p className="text-sm text-slate-300">{block.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="flex items-center gap-1.5 text-base text-slate-200">
        <Timer className="h-5 w-5" aria-hidden /> Total duration {VALIDATION_DURATION}
      </p>

      <HudButton icon={ScanFace} onClick={onStart}>
        Verify identity &amp; start
      </HudButton>
    </div>
  )
}
