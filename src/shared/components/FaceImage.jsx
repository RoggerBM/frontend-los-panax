/**
 * Cara de un tripulante. Si la imagen es generada con IA (person.aiGenerated), le superpone una marca:
 * - badge="sm": pastilla "AI" en la esquina (avatares pequeños)
 * - badge="lg": texto "AI generated" en la parte inferior (imágenes grandes)
 * - badge="none": sin marca (el contenedor ya muestra la suya)
 */
export default function FaceImage({ person, className, style, badge = 'sm', alt = '' }) {
  const ai = Boolean(person?.aiGenerated) && badge !== 'none'
  return (
    <span className="relative inline-flex shrink-0" title={person?.aiGenerated ? 'AI-generated image' : undefined}>
      <img src={person?.image} alt={alt} className={className} style={style} />
      {ai &&
        (badge === 'lg' ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[inherit] bg-black/75 py-0.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            AI generated
          </span>
        ) : (
          <span
            className="pointer-events-none absolute -bottom-1.5 -right-1.5 z-10 rounded border border-white bg-[#7c3aed] px-1 font-mono text-[9px] font-extrabold leading-[1.35] text-white shadow-[0_0_6px_rgb(124_58_237/0.8)]"
            aria-label="AI generated"
          >
            AI
          </span>
        ))}
    </span>
  )
}
