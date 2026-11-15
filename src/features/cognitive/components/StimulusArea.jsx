/** Zona táctil grande para responder con clic o toque (pointerdown = menor latencia). */
export default function StimulusArea({ onPress, children }) {
  return (
    <div
      role="button"
      aria-label="Response area"
      onPointerDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      className="flex h-72 w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-xl border-[1.5px] border-line bg-void"
    >
      {children}
    </div>
  )
}
