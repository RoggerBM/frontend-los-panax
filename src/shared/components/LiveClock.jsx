import { useNow } from '@/shared/hooks/useNow'
import { formatClock } from '@/shared/utils/format'

export default function LiveClock({ className }) {
  const now = useNow(1000)
  return (
    <time dateTime={now.toISOString()} className={className}>
      {formatClock(now)} UTC
    </time>
  )
}
