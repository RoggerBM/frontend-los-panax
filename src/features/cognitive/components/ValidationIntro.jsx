import { ScanFace, Timer } from 'lucide-react'
import { TESTS } from '../config/tests'
import { VALIDATION_BLOCKS, VALIDATION_DURATION } from '../config/validation'
import HudButton from './HudButton'

export default function ValidationIntro({ user, onStart, onChangeOperator }) {
  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <img src={user.image} alt="" className="h-12 w-12 rounded-lg border-[1.5px] border-cyan/60 object-cover" />
        <div className="flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan">Operator</p>
          <h2 className="text-lg font-extrabold text-white">{user.name}</h2>
        </div>
        {onChangeOperator && (
          <button
            type="button"
            onClick={onChangeOperator}
            className="rounded-md border border-line px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-cyan hover:text-cyan"
          >
            Change
          </button>
        )}
      </div>

      <p className="text-sm text-slate-300">
        A short alertness check that estimates your reaction times. It runs three blocks back to back:
      </p>

      <ol className="flex flex-col gap-2">
        <li className="flex items-center gap-3 rounded-lg border border-cyan/40 bg-cyan/5 px-3 py-2.5">
          <span className="font-mono text-xs text-slate-500">0</span>
          <ScanFace className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold text-slate-100">
              Biometric validation <span className="font-mono text-[10px] text-cyan">FACE SCAN</span>
            </p>
            <p className="text-xs text-slate-400">Confirms your identity with the camera before the blocks start.</p>
          </div>
        </li>
        {VALIDATION_BLOCKS.map((block, i) => {
          const test = TESTS[block.id]
          const Icon = test.icon
          return (
            <li key={block.id} className="flex items-center gap-3 rounded-lg border border-line bg-void px-3 py-2.5">
              <span className="font-mono text-xs text-slate-500">{i + 1}</span>
              <Icon className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold text-slate-100">
                  {test.name} <span className="font-mono text-[10px] text-cyan">{test.tag}</span>
                </p>
                <p className="text-xs text-slate-400">{block.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Timer className="h-4 w-4" aria-hidden /> Total duration {VALIDATION_DURATION}
      </p>

      <HudButton icon={ScanFace} onClick={onStart}>
        Verify identity &amp; start
      </HudButton>
    </div>
  )
}
