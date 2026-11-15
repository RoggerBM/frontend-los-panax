import { useId } from 'react'

/** Retrato ilustrado del astronauta (diseño AEGIS-MED). */
export default function AstronautPortrait({ stripe, statusHex }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 180 180" className="block h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#1C2842" />
          <stop offset="100%" stopColor="#090D16" />
        </radialGradient>
        <linearGradient id={`suit${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="55%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id={`visor${uid}`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id={`glare${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38FEDC" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" fill={`url(#bg${uid})`} />
      <circle cx="90" cy="84" r="68" fill="none" stroke={statusHex} strokeOpacity="0.22" strokeDasharray="4 3" />
      <path
        d="M14 22h14M14 22v14M166 22h-14M166 22v14M14 158h14M14 158v-14M166 158h-14M166 158v-14"
        stroke="#38FEDC"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="44" y="54" width="92" height="72" rx="14" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <rect x="52" y="46" width="12" height="14" rx="3" fill="#64748B" />
      <rect x="116" y="46" width="12" height="14" rx="3" fill="#64748B" />
      <path
        d="M24 176 C26 138, 46 124, 90 124 C134 124, 154 138, 156 176 Z"
        fill={`url(#suit${uid})`}
        stroke="#475569"
        strokeWidth="1.5"
      />
      <path d="M35 148 L52 136 L56 143 L39 155 Z" fill={stripe} />
      <path d="M145 148 L128 136 L124 143 L141 155 Z" fill={stripe} />
      <rect x="66" y="136" width="48" height="34" rx="5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
      <rect x="72" y="142" width="22" height="10" rx="2" fill="#090D16" stroke="#38FEDC" />
      <circle cx="103" cy="147" r="3.5" fill={statusHex} />
      <rect x="72" y="156" width="10" height="7" rx="1.5" fill="#132ED1" />
      <rect x="85" y="156" width="10" height="7" rx="1.5" fill="#EF7D0D" />
      <rect x="98" y="156" width="10" height="7" rx="1.5" fill="#C51111" />
      <ellipse cx="90" cy="123" rx="34" ry="8" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="90" cy="78" r="44" fill={`url(#suit${uid})`} stroke="#64748B" strokeWidth="1.8" />
      <rect x="41" y="68" width="8" height="22" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="131" y="68" width="8" height="22" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="82" y="30" width="16" height="6" rx="3" fill="#1E293B" stroke="#64748B" />
      <circle cx="90" cy="33" r="2.2" fill={statusHex} />
      <path
        d="M54 74 C54 53, 126 53, 126 74 C126 97, 112 110, 90 110 C68 110, 54 97, 54 74 Z"
        fill={`url(#visor${uid})`}
        stroke="#1E293B"
        strokeWidth="2.5"
      />
      <path d="M61 69 C63 57, 88 55, 104 60 C87 62, 70 69, 64 85 C60 80, 60 74, 61 69 Z" fill={`url(#glare${uid})`} />
    </svg>
  )
}
