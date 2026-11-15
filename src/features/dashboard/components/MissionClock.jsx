import { useNow } from '@/shared/hooks/useNow'
import { formatElapsed } from '@/shared/utils/format'

export default function MissionClock({ since, className }) {
  const now = useNow(1000)
  return <span className={className}>{formatElapsed(now.getTime() - (since ?? now.getTime()))}</span>
}
