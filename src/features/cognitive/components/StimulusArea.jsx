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
      className="flex h-[26rem] w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-2xl border-2 border-cyan/50 bg-[#22324F]"
    >
      {children}
    </div>
  )
}
