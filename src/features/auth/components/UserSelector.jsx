import clsx from 'clsx'
import { FolderOpen } from 'lucide-react'

export default function UserSelector({ users, selectedId, onSelect, disabled }) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-brand/30 p-8 text-center text-sm text-paper/60">
        <FolderOpen className="h-8 w-8 text-brand/60" aria-hidden />
        <p>No hay rostros registrados.</p>
        <p className="text-xs">
          Agrega imágenes en <code className="text-brand-soft">src/assets/faces/</code>
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {users.map((user) => {
        const selected = user.id === selectedId
        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onSelect(user.id)}
              disabled={disabled}
              aria-pressed={selected}
              className={clsx(
                'group flex w-full flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all',
                'disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'border-brand bg-brand/10 shadow-[0_0_18px_-4px_rgb(99_102_241/0.6)]'
                  : 'border-paper/10 bg-paper/5 hover:border-brand/50 hover:bg-paper/10',
              )}
            >
              <img
                src={user.image}
                alt=""
                className={clsx(
                  'h-16 w-16 rounded-full object-cover ring-2 transition',
                  selected ? 'ring-brand' : 'ring-paper/20 grayscale group-hover:grayscale-0',
                )}
              />
              <span className="text-xs font-medium text-paper">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-paper/50">
                {user.crewCode}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
