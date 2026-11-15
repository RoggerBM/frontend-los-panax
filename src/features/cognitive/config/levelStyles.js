import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'

/** Estilos por nivel de veredicto: ok | caution | fail */
export const LEVEL_STYLES = {
  ok: { text: 'text-brand-soft', border: 'border-brand/50', bg: 'bg-brand/10', dot: 'bg-brand', icon: ShieldCheck },
  caution: { text: 'text-amber-300', border: 'border-amber-400/50', bg: 'bg-amber-400/10', dot: 'bg-amber-400', icon: ShieldAlert },
  fail: { text: 'text-rose-300', border: 'border-rose-500/50', bg: 'bg-rose-500/10', dot: 'bg-rose-500', icon: ShieldX },
}
