/** Zona táctil grande para responder con clic o toque (pointerdown = menor latencia). */
export default function StimulusArea({ onPress, children }) {
  return (
    <div
      role="button"
      aria-label="Zona de respuesta"
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      className="flex h-72 w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-xl border border-brand/20 bg-black/20"
    >
      {children}
    </div>
  )
}
