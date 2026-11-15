import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'

/** Estilos por nivel de veredicto (paleta AEGIS): ok | caution | fail */
export const LEVEL_STYLES = {
  ok: { text: 'text-lime', border: 'border-lime/50', bg: 'bg-lime/10', dot: 'bg-lime', icon: ShieldCheck },
  caution: { text: 'text-caution', border: 'border-caution/50', bg: 'bg-caution/10', dot: 'bg-caution', icon: ShieldAlert },
  fail: { text: 'text-[#FF6B6B]', border: 'border-critical/60', bg: 'bg-critical/10', dot: 'bg-critical', icon: ShieldX },
}
