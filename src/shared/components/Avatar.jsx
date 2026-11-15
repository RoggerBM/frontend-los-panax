import clsx from 'clsx'

const SIZES = {
  xs: 'h-7 w-7',
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
}

export default function Avatar({ src, alt, size = 'md', className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={clsx('rounded-full object-cover ring-2 ring-brand/40', SIZES[size], className)}
    />
  )
}
